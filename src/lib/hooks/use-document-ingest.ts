'use client'

import { useState, useCallback, useRef, useEffect } from 'react'

export interface DocumentIngestParams {
  file: File
  vehicleId?: string
  metadata?: Record<string, unknown>
}

export interface IngestJob {
  job_id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress?: number
  created_at: string
  completed_at?: string
  result?: {
    chunks_created: number
    embeddings_generated: number
    errors?: string[]
  }
  error?: string
}

export interface IngestError {
  code: string
  message: string
  status: number
}

interface UseDocumentIngestOptions {
  onSuccess?: (job: IngestJob) => void
  onError?: (error: IngestError) => void
  onProgress?: (progress: number) => void
  pollInterval?: number
}

interface UseDocumentIngestReturn {
  ingestDocument: (params: DocumentIngestParams) => Promise<IngestJob | null>
  checkJobStatus: (jobId: string) => Promise<IngestJob | null>
  isUploading: boolean
  isProcessing: boolean
  currentJob: IngestJob | null
  error: IngestError | null
  reset: () => void
}

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
const ALLOWED_EXTENSIONS = ['.pdf', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg']
const POLL_INTERVAL = 2000 // 2 seconds

/**
 * Hook for uploading documents to the RAG ingestion pipeline
 *
 * Handles:
 * - File validation (size, type)
 * - Base64 encoding
 * - Upload to /api/rag/ingest
 * - Job status polling
 * - Progress tracking
 *
 * Usage:
 * ```tsx
 * const { ingestDocument, isUploading, isProcessing, currentJob, error } = useDocumentIngest({
 *   onSuccess: (job) => toast.success(`Document processed: ${job.result?.chunks_created} chunks`),
 *   onError: (err) => toast.error(err.message),
 * })
 *
 * const handleUpload = async (file: File) => {
 *   await ingestDocument({ file, vehicleId: vehicle?.id })
 * }
 * ```
 */
export function useDocumentIngest(options?: UseDocumentIngestOptions): UseDocumentIngestReturn {
  const [isUploading, setIsUploading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentJob, setCurrentJob] = useState<IngestJob | null>(null)
  const [error, setError] = useState<IngestError | null>(null)

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const pollInterval = options?.pollInterval ?? POLL_INTERVAL

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
      }
    }
  }, [])

  const validateFile = (file: File): IngestError | null => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return {
        code: 'file_too_large',
        message: `File size exceeds 50MB limit (${(file.size / 1024 / 1024).toFixed(1)}MB)`,
        status: 413,
      }
    }

    // Check file extension
    const ext = file.name.toLowerCase().slice(file.name.lastIndexOf('.'))
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return {
        code: 'invalid_file_type',
        message: `Invalid file type. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`,
        status: 400,
      }
    }

    return null
  }

  const getFileType = (file: File): 'pdf' | 'image' | 'schematic' => {
    const ext = file.name.toLowerCase().slice(file.name.lastIndexOf('.'))
    if (ext === '.pdf') return 'pdf'
    return 'image' // Default to image for all other allowed types
  }

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        // Remove data URL prefix (e.g., "data:application/pdf;base64,")
        const base64 = result.split(',')[1]
        resolve(base64)
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsDataURL(file)
    })
  }

  const checkJobStatus = useCallback(async (jobId: string): Promise<IngestJob | null> => {
    try {
      const response = await fetch(`/api/rag/ingest?job_id=${encodeURIComponent(jobId)}`)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw {
          code: errorData.error || 'status_check_failed',
          message: errorData.message || `Status check failed: ${response.status}`,
          status: response.status,
        }
      }

      return await response.json()
    } catch (err) {
      if ((err as IngestError).code) {
        throw err
      }
      throw {
        code: 'network_error',
        message: err instanceof Error ? err.message : 'Network error',
        status: 0,
      }
    }
  }, [])

  const startPolling = useCallback((jobId: string) => {
    // Clear any existing polling
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current)
    }

    setIsProcessing(true)

    pollIntervalRef.current = setInterval(async () => {
      try {
        const job = await checkJobStatus(jobId)

        if (!job) return

        setCurrentJob(job)

        // Report progress
        if (job.progress !== undefined) {
          options?.onProgress?.(job.progress)
        }

        // Check if job is complete
        if (job.status === 'completed' || job.status === 'failed') {
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current)
            pollIntervalRef.current = null
          }
          setIsProcessing(false)

          if (job.status === 'completed') {
            options?.onSuccess?.(job)
          } else if (job.status === 'failed') {
            const error: IngestError = {
              code: 'processing_failed',
              message: job.error || 'Document processing failed',
              status: 500,
            }
            setError(error)
            options?.onError?.(error)
          }
        }
      } catch (err) {
        const error = err as IngestError
        setError(error)
        options?.onError?.(error)

        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current)
          pollIntervalRef.current = null
        }
        setIsProcessing(false)
      }
    }, pollInterval)
  }, [checkJobStatus, options, pollInterval])

  const ingestDocument = useCallback(async (params: DocumentIngestParams): Promise<IngestJob | null> => {
    setError(null)
    setCurrentJob(null)

    // Validate file
    const validationError = validateFile(params.file)
    if (validationError) {
      setError(validationError)
      options?.onError?.(validationError)
      return null
    }

    setIsUploading(true)

    try {
      // Convert file to base64
      const fileContent = await fileToBase64(params.file)
      const fileType = getFileType(params.file)

      // Send to API
      const response = await fetch('/api/rag/ingest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file_content: fileContent,
          file_name: params.file.name,
          file_type: fileType,
          vehicle_id: params.vehicleId,
          metadata: params.metadata,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))

        let error: IngestError

        if (response.status === 401) {
          error = {
            code: 'unauthorized',
            message: 'Please log in to upload documents',
            status: 401,
          }
        } else if (response.status === 402) {
          error = {
            code: 'subscription_required',
            message: errorData.message || 'An active subscription is required to upload documents',
            status: 402,
          }
        } else if (response.status === 413) {
          error = {
            code: 'file_too_large',
            message: 'File size exceeds 50MB limit',
            status: 413,
          }
        } else if (response.status === 429) {
          error = {
            code: 'rate_limited',
            message: 'Upload limit reached. Please try again later.',
            status: 429,
          }
        } else {
          error = {
            code: errorData.error || 'upload_failed',
            message: errorData.message || `Upload failed: ${response.status}`,
            status: response.status,
          }
        }

        setError(error)
        options?.onError?.(error)
        return null
      }

      const job: IngestJob = await response.json()
      setCurrentJob(job)
      setIsUploading(false)

      // Start polling for job status
      startPolling(job.job_id)

      return job
    } catch (err) {
      const error: IngestError = {
        code: 'network_error',
        message: err instanceof Error ? err.message : 'Network error during upload',
        status: 0,
      }
      setError(error)
      options?.onError?.(error)
      return null
    } finally {
      setIsUploading(false)
    }
  }, [options, startPolling])

  const reset = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current)
      pollIntervalRef.current = null
    }
    setIsUploading(false)
    setIsProcessing(false)
    setCurrentJob(null)
    setError(null)
  }, [])

  return {
    ingestDocument,
    checkJobStatus,
    isUploading,
    isProcessing,
    currentJob,
    error,
    reset,
  }
}

/**
 * Get human-readable status text for an ingestion job
 */
export function getJobStatusText(job: IngestJob | null): string {
  if (!job) return ''

  switch (job.status) {
    case 'pending':
      return 'Queued for processing...'
    case 'processing':
      return job.progress !== undefined
        ? `Processing... ${Math.round(job.progress)}%`
        : 'Processing document...'
    case 'completed':
      return 'Document processed successfully'
    case 'failed':
      return job.error || 'Processing failed'
    default:
      return 'Unknown status'
  }
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
