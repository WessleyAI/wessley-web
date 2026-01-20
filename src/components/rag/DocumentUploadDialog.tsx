'use client'

import * as React from 'react'
import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  IconUpload,
  IconFile,
  IconFileTypePdf,
  IconPhoto,
  IconTrash,
  IconLoader2,
  IconCheck,
  IconX,
  IconAlertTriangle,
  IconCar,
} from '@tabler/icons-react'
import { toast } from 'sonner'
import {
  useDocumentIngest,
  getJobStatusText,
  formatFileSize,
  type IngestJob,
  type IngestError,
} from '@/lib/hooks/use-document-ingest'

interface VehicleInfo {
  make: string
  model: string
  year: number
  id?: string
}

interface DocumentUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  vehicle?: VehicleInfo | null
  workspaceId?: string
  onSuccess?: (job: IngestJob) => void
}

type UploadStep = 'select' | 'vehicle' | 'uploading' | 'processing' | 'complete' | 'error'

const ACCEPTED_FILE_TYPES = '.pdf,.png,.jpg,.jpeg,.gif,.webp,.svg'
const MAX_FILE_SIZE_MB = 50

export function DocumentUploadDialog({
  open,
  onOpenChange,
  vehicle,
  workspaceId,
  onSuccess,
}: DocumentUploadDialogProps) {
  const [step, setStep] = useState<UploadStep>('select')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  // Vehicle info for new uploads (if no vehicle provided)
  const [vehicleMake, setVehicleMake] = useState('')
  const [vehicleModel, setVehicleModel] = useState('')
  const [vehicleYear, setVehicleYear] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    ingestDocument,
    isUploading,
    isProcessing,
    currentJob,
    error,
    reset: resetIngest,
  } = useDocumentIngest({
    onSuccess: (job) => {
      setStep('complete')
      onSuccess?.(job)
    },
    onError: (err) => {
      setStep('error')
      if (err.code === 'subscription_required') {
        toast.error('Subscription required', {
          description: 'Upgrade to upload documents to your knowledge base.',
          action: {
            label: 'Upgrade',
            onClick: () => window.location.href = '/pricing',
          },
        })
      } else if (err.code === 'rate_limited') {
        toast.error('Rate limit reached', {
          description: 'Please try again later.',
        })
      }
    },
    onProgress: (progress) => {
      if (progress > 0) {
        setStep('processing')
      }
    },
  })

  const handleClose = useCallback(() => {
    onOpenChange(false)
    // Reset state after dialog closes
    setTimeout(() => {
      setStep('select')
      setSelectedFile(null)
      setPreviewUrl(null)
      setVehicleMake('')
      setVehicleModel('')
      setVehicleYear('')
      resetIngest()
    }, 300)
  }, [onOpenChange, resetIngest])

  const handleFileSelect = useCallback((file: File) => {
    // Validate file type
    const ext = file.name.toLowerCase().slice(file.name.lastIndexOf('.'))
    const allowedExts = ACCEPTED_FILE_TYPES.split(',')
    if (!allowedExts.includes(ext)) {
      toast.error('Invalid file type', {
        description: `Allowed types: PDF, PNG, JPG, WebP, GIF, SVG`,
      })
      return
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      toast.error('File too large', {
        description: `Maximum file size is ${MAX_FILE_SIZE_MB}MB`,
      })
      return
    }

    setSelectedFile(file)

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    } else {
      setPreviewUrl(null)
    }
  }, [])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }, [handleFileSelect])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }, [handleFileSelect])

  const handleClearFile = useCallback(() => {
    setSelectedFile(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [previewUrl])

  const handleUpload = useCallback(async () => {
    if (!selectedFile) return

    // If no vehicle provided and vehicle info not filled, show vehicle step
    if (!vehicle && !vehicleMake && !vehicleModel && !vehicleYear) {
      setStep('vehicle')
      return
    }

    setStep('uploading')

    const vehicleId = vehicle?.id || undefined
    const metadata: Record<string, unknown> = {}

    // Include vehicle metadata if provided
    if (vehicle) {
      metadata.vehicle_make = vehicle.make
      metadata.vehicle_model = vehicle.model
      metadata.vehicle_year = vehicle.year
    } else if (vehicleMake && vehicleModel && vehicleYear) {
      metadata.vehicle_make = vehicleMake
      metadata.vehicle_model = vehicleModel
      metadata.vehicle_year = parseInt(vehicleYear, 10)
    }

    if (workspaceId) {
      metadata.workspace_id = workspaceId
    }

    await ingestDocument({
      file: selectedFile,
      vehicleId,
      metadata,
    })
  }, [selectedFile, vehicle, vehicleMake, vehicleModel, vehicleYear, workspaceId, ingestDocument])

  const handleSkipVehicle = useCallback(async () => {
    if (!selectedFile) return
    setStep('uploading')

    const metadata: Record<string, unknown> = {}
    if (workspaceId) {
      metadata.workspace_id = workspaceId
    }

    await ingestDocument({
      file: selectedFile,
      metadata,
    })
  }, [selectedFile, workspaceId, ingestDocument])

  const handleVehicleSubmit = useCallback(async () => {
    if (!vehicleMake.trim() || !vehicleModel.trim() || !vehicleYear.trim()) {
      toast.error('Please fill in all vehicle fields')
      return
    }

    const year = parseInt(vehicleYear, 10)
    if (isNaN(year) || year < 1900 || year > new Date().getFullYear() + 1) {
      toast.error('Please enter a valid year')
      return
    }

    await handleUpload()
  }, [vehicleMake, vehicleModel, vehicleYear, handleUpload])

  const getFileIcon = (file: File) => {
    if (file.type === 'application/pdf') {
      return <IconFileTypePdf className="w-12 h-12" style={{ color: 'var(--app-accent)' }} />
    }
    if (file.type.startsWith('image/')) {
      return <IconPhoto className="w-12 h-12" style={{ color: 'var(--app-accent)' }} />
    }
    return <IconFile className="w-12 h-12" style={{ color: 'var(--app-accent)' }} />
  }

  const renderStepContent = () => {
    switch (step) {
      case 'select':
        return (
          <div className="space-y-4">
            {/* Drop Zone */}
            <label
              htmlFor="document-upload"
              className={`
                flex flex-col items-center justify-center w-full h-48
                border-2 border-dashed rounded-lg cursor-pointer
                transition-all duration-200
                ${isDragOver ? 'border-[var(--app-accent)] bg-[var(--app-accent)]/5' : 'border-[var(--app-border)]'}
                hover:border-[var(--app-accent)] hover:bg-[var(--app-bg-tertiary)]
              `}
              style={{ backgroundColor: 'var(--app-bg-secondary)' }}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {selectedFile ? (
                <div className="flex flex-col items-center text-center p-4">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-20 h-20 object-contain rounded mb-3"
                    />
                  ) : (
                    getFileIcon(selectedFile)
                  )}
                  <p className="app-body-sm app-text-primary font-medium truncate max-w-[200px]">
                    {selectedFile.name}
                  </p>
                  <p className="app-caption app-text-muted">
                    {formatFileSize(selectedFile.size)}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 app-text-muted hover:text-red-500"
                    onClick={(e) => {
                      e.preventDefault()
                      handleClearFile()
                    }}
                  >
                    <IconTrash className="w-4 h-4 mr-1" />
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <IconUpload className="w-10 h-10 mb-3 app-text-muted" />
                  <p className="mb-2 app-body-sm app-text-secondary">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="app-caption app-text-muted">
                    PDF, PNG, JPG, WebP (max {MAX_FILE_SIZE_MB}MB)
                  </p>
                </div>
              )}
              <input
                ref={fileInputRef}
                id="document-upload"
                type="file"
                className="hidden"
                accept={ACCEPTED_FILE_TYPES}
                onChange={handleInputChange}
              />
            </label>

            {/* Vehicle Context Info */}
            {vehicle && (
              <div
                className="flex items-center gap-3 p-3 rounded-lg"
                style={{ backgroundColor: 'var(--app-bg-tertiary)' }}
              >
                <IconCar className="w-5 h-5 app-text-muted" />
                <div>
                  <p className="app-body-sm app-text-primary">
                    {vehicle.make} {vehicle.model} {vehicle.year}
                  </p>
                  <p className="app-caption app-text-muted">
                    Document will be linked to this vehicle
                  </p>
                </div>
              </div>
            )}
          </div>
        )

      case 'vehicle':
        return (
          <div className="space-y-4">
            <div
              className="flex items-center gap-3 p-3 rounded-lg mb-4"
              style={{ backgroundColor: 'var(--app-bg-tertiary)' }}
            >
              <IconCar className="w-5 h-5 app-text-muted" />
              <p className="app-body-sm app-text-secondary">
                Add vehicle info to improve search relevance (optional)
              </p>
            </div>

            <div className="grid gap-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="v-make" className="text-right app-body-sm">
                  Make
                </Label>
                <Input
                  id="v-make"
                  value={vehicleMake}
                  onChange={(e) => setVehicleMake(e.target.value)}
                  placeholder="e.g., Toyota"
                  className="col-span-3 app-body"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="v-model" className="text-right app-body-sm">
                  Model
                </Label>
                <Input
                  id="v-model"
                  value={vehicleModel}
                  onChange={(e) => setVehicleModel(e.target.value)}
                  placeholder="e.g., Camry"
                  className="col-span-3 app-body"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="v-year" className="text-right app-body-sm">
                  Year
                </Label>
                <Input
                  id="v-year"
                  type="number"
                  value={vehicleYear}
                  onChange={(e) => setVehicleYear(e.target.value)}
                  placeholder="e.g., 2020"
                  className="col-span-3 app-body"
                  min={1900}
                  max={new Date().getFullYear() + 1}
                />
              </div>
            </div>
          </div>
        )

      case 'uploading':
      case 'processing':
        return (
          <div className="flex flex-col items-center justify-center py-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <IconLoader2 className="w-12 h-12" style={{ color: 'var(--app-accent)' }} />
            </motion.div>
            <p className="mt-4 app-body app-text-primary">
              {isUploading ? 'Uploading document...' : getJobStatusText(currentJob)}
            </p>
            {currentJob && currentJob.progress !== undefined && (
              <div className="w-full max-w-xs mt-4">
                <Progress value={currentJob.progress} className="h-2" />
                <p className="mt-2 app-caption app-text-muted text-center">
                  {Math.round(currentJob.progress)}% complete
                </p>
              </div>
            )}
          </div>
        )

      case 'complete':
        return (
          <div className="flex flex-col items-center justify-center py-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'var(--app-accent)' }}
              >
                <IconCheck className="w-8 h-8 text-black" />
              </div>
            </motion.div>
            <p className="mt-4 app-body app-text-primary font-medium">
              Document processed successfully!
            </p>
            {currentJob?.result && (
              <div className="mt-3 text-center">
                <p className="app-body-sm app-text-secondary">
                  {currentJob.result.chunks_created} text chunks indexed
                </p>
                <p className="app-caption app-text-muted">
                  {currentJob.result.embeddings_generated} embeddings generated
                </p>
              </div>
            )}
          </div>
        )

      case 'error':
        return (
          <div className="flex flex-col items-center justify-center py-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            >
              <div className="w-16 h-16 rounded-full flex items-center justify-center bg-red-500/20">
                <IconX className="w-8 h-8 text-red-500" />
              </div>
            </motion.div>
            <p className="mt-4 app-body app-text-primary font-medium">
              Upload failed
            </p>
            <p className="mt-2 app-body-sm app-text-muted text-center max-w-sm">
              {error?.message || 'An error occurred while processing your document.'}
            </p>
            {error?.code === 'subscription_required' && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => window.location.href = '/pricing'}
              >
                View Plans
              </Button>
            )}
          </div>
        )
    }
  }

  const renderFooter = () => {
    switch (step) {
      case 'select':
        return (
          <>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile}
              style={selectedFile ? { backgroundColor: 'var(--app-accent)', color: 'black' } : {}}
            >
              <IconUpload className="w-4 h-4 mr-2" />
              Upload Document
            </Button>
          </>
        )

      case 'vehicle':
        return (
          <>
            <Button variant="outline" onClick={handleSkipVehicle}>
              Skip
            </Button>
            <Button
              onClick={handleVehicleSubmit}
              disabled={!vehicleMake.trim() || !vehicleModel.trim() || !vehicleYear.trim()}
              style={{ backgroundColor: 'var(--app-accent)', color: 'black' }}
            >
              Continue
            </Button>
          </>
        )

      case 'uploading':
      case 'processing':
        return (
          <Button variant="outline" disabled>
            <IconLoader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing...
          </Button>
        )

      case 'complete':
        return (
          <Button
            onClick={handleClose}
            style={{ backgroundColor: 'var(--app-accent)', color: 'black' }}
          >
            Done
          </Button>
        )

      case 'error':
        return (
          <>
            <Button variant="outline" onClick={handleClose}>
              Close
            </Button>
            <Button
              onClick={() => {
                resetIngest()
                setStep('select')
              }}
            >
              Try Again
            </Button>
          </>
        )
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen && !isUploading && !isProcessing) {
        handleClose()
      }
    }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="app-h5 flex items-center gap-2">
            <IconFile className="w-5 h-5" />
            Upload Document
          </DialogTitle>
          <DialogDescription className="app-body app-text-muted">
            {step === 'select' && 'Upload a service manual, wiring diagram, or technical document to enhance AI assistance.'}
            {step === 'vehicle' && 'Link this document to a specific vehicle for better search results.'}
            {step === 'uploading' && 'Your document is being uploaded...'}
            {step === 'processing' && 'Processing and indexing your document...'}
            {step === 'complete' && 'Your document has been added to the knowledge base.'}
            {step === 'error' && 'There was a problem uploading your document.'}
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>

        <DialogFooter className="gap-2">
          {renderFooter()}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
