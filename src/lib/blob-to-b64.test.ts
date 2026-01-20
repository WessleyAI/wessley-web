/**
 * Tests for Blob to Base64 conversion utility
 *
 * This utility converts binary file data (Blobs) to Base64 data URLs.
 * Critical for image uploads - vehicle photos are encoded for transmission.
 *
 * Why these tests matter:
 * - Image upload depends on correct encoding
 * - Corrupted Base64 = broken images in the system
 * - FileReader error handling prevents silent failures
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { convertBlobToBase64 } from './blob-to-b64'

describe('convertBlobToBase64', () => {
  describe('basic conversion', () => {
    it('should convert a text blob to base64 data URL', async () => {
      const blob = new Blob(['Hello, World!'], { type: 'text/plain' })
      const result = await convertBlobToBase64(blob)

      expect(result).toMatch(/^data:text\/plain;base64,/)
      // "Hello, World!" in Base64 is "SGVsbG8sIFdvcmxkIQ=="
      expect(result).toBe('data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==')
    })

    it('should convert an empty blob', async () => {
      const blob = new Blob([], { type: 'text/plain' })
      const result = await convertBlobToBase64(blob)

      expect(result).toBe('data:text/plain;base64,')
    })

    it('should preserve the MIME type in data URL', async () => {
      const pngBlob = new Blob([new Uint8Array([0x89, 0x50, 0x4E, 0x47])], { type: 'image/png' })
      const result = await convertBlobToBase64(pngBlob)

      expect(result).toMatch(/^data:image\/png;base64,/)
    })

    it('should handle JSON content', async () => {
      const jsonBlob = new Blob([JSON.stringify({ key: 'value' })], { type: 'application/json' })
      const result = await convertBlobToBase64(jsonBlob)

      expect(result).toMatch(/^data:application\/json;base64,/)
      // Decode to verify content integrity
      const base64Part = result.split(',')[1]
      const decoded = atob(base64Part)
      expect(JSON.parse(decoded)).toEqual({ key: 'value' })
    })

    it('should handle binary content', async () => {
      // Create binary data (e.g., a small "image")
      const binaryData = new Uint8Array([0x00, 0x01, 0x02, 0xFF, 0xFE, 0xFD])
      const blob = new Blob([binaryData], { type: 'application/octet-stream' })
      const result = await convertBlobToBase64(blob)

      expect(result).toMatch(/^data:application\/octet-stream;base64,/)

      // Verify binary content is preserved
      const base64Part = result.split(',')[1]
      const decoded = atob(base64Part)
      expect(decoded.charCodeAt(0)).toBe(0x00)
      expect(decoded.charCodeAt(3)).toBe(0xFF)
    })
  })

  describe('image handling', () => {
    it('should handle image/jpeg MIME type', async () => {
      // JPEG magic bytes: FF D8 FF
      const jpegMagicBytes = new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0])
      const blob = new Blob([jpegMagicBytes], { type: 'image/jpeg' })
      const result = await convertBlobToBase64(blob)

      expect(result).toMatch(/^data:image\/jpeg;base64,/)
    })

    it('should handle image/png MIME type', async () => {
      // PNG magic bytes: 89 50 4E 47
      const pngMagicBytes = new Uint8Array([0x89, 0x50, 0x4E, 0x47])
      const blob = new Blob([pngMagicBytes], { type: 'image/png' })
      const result = await convertBlobToBase64(blob)

      expect(result).toMatch(/^data:image\/png;base64,/)
    })

    it('should handle image/webp MIME type', async () => {
      const blob = new Blob(['RIFF....WEBP'], { type: 'image/webp' })
      const result = await convertBlobToBase64(blob)

      expect(result).toMatch(/^data:image\/webp;base64,/)
    })

    it('should handle large image-like blobs', async () => {
      // Create a larger blob (simulating a small image)
      const largeData = new Uint8Array(10000)
      for (let i = 0; i < largeData.length; i++) {
        largeData[i] = i % 256
      }
      const blob = new Blob([largeData], { type: 'image/png' })
      const result = await convertBlobToBase64(blob)

      expect(result).toMatch(/^data:image\/png;base64,/)
      // Base64 is ~4/3 times larger than binary
      expect(result.length).toBeGreaterThan(13000)
    })
  })

  describe('special characters and encoding', () => {
    it('should handle UTF-8 text', async () => {
      const blob = new Blob(['日本語テキスト'], { type: 'text/plain' })
      const result = await convertBlobToBase64(blob)

      expect(result).toMatch(/^data:text\/plain;base64,/)

      // Verify content can be decoded back
      const base64Part = result.split(',')[1]
      const decoded = atob(base64Part)
      // Note: Blob uses UTF-8, so decoding requires TextDecoder
      const bytes = new Uint8Array(decoded.split('').map(c => c.charCodeAt(0)))
      const text = new TextDecoder().decode(bytes)
      expect(text).toBe('日本語テキスト')
    })

    it('should handle special ASCII characters', async () => {
      const blob = new Blob(['Line1\nLine2\tTab\rCarriage'], { type: 'text/plain' })
      const result = await convertBlobToBase64(blob)

      expect(result).toMatch(/^data:text\/plain;base64,/)

      const base64Part = result.split(',')[1]
      const decoded = atob(base64Part)
      expect(decoded).toBe('Line1\nLine2\tTab\rCarriage')
    })

    it('should handle null bytes', async () => {
      const blob = new Blob([new Uint8Array([0x00, 0x00, 0x00])], { type: 'application/octet-stream' })
      const result = await convertBlobToBase64(blob)

      expect(result).toMatch(/^data:application\/octet-stream;base64,/)

      const base64Part = result.split(',')[1]
      expect(base64Part).toBe('AAAA') // Three null bytes = AAAA in Base64
    })
  })

  describe('data URL format', () => {
    it('should return a valid data URL format', async () => {
      const blob = new Blob(['test'], { type: 'text/plain' })
      const result = await convertBlobToBase64(blob)

      // Data URL format: data:[<mediatype>][;base64],<data>
      const dataUrlRegex = /^data:[a-zA-Z0-9.+-]+\/[a-zA-Z0-9.+-]+;base64,[A-Za-z0-9+/]*={0,2}$/
      expect(result).toMatch(dataUrlRegex)
    })

    it('should handle MIME types with parameters', async () => {
      const blob = new Blob(['test'], { type: 'text/plain; charset=utf-8' })
      const result = await convertBlobToBase64(blob)

      // Should still work, but browser may normalize MIME type
      expect(result).toMatch(/^data:text\/plain/)
    })

    it('should handle blobs without explicit MIME type', async () => {
      const blob = new Blob(['test'])
      const result = await convertBlobToBase64(blob)

      // Default MIME type is empty string, which becomes "data:;base64,..."
      // or "data:application/octet-stream;base64,..." depending on browser
      expect(result).toMatch(/^data:/)
      expect(result).toContain(';base64,')
    })
  })

  describe('error handling', () => {
    it('should reject on FileReader error', async () => {
      // Create a mock that simulates FileReader error
      const originalFileReader = globalThis.FileReader

      class MockErrorFileReader {
        onloadend: (() => void) | null = null
        onerror: ((error: Error) => void) | null = null
        result: string | null = null

        readAsDataURL() {
          // Simulate async error
          setTimeout(() => {
            if (this.onerror) {
              this.onerror(new Error('Read error'))
            }
          }, 0)
        }
      }

      // @ts-expect-error - Replacing FileReader for test
      globalThis.FileReader = MockErrorFileReader

      try {
        const blob = new Blob(['test'], { type: 'text/plain' })
        await expect(convertBlobToBase64(blob)).rejects.toThrow()
      } finally {
        globalThis.FileReader = originalFileReader
      }
    })
  })

  describe('performance', () => {
    it('should handle moderately large blobs efficiently', async () => {
      // 100KB blob
      const largeData = new Uint8Array(100 * 1024)
      const blob = new Blob([largeData], { type: 'application/octet-stream' })

      const start = performance.now()
      const result = await convertBlobToBase64(blob)
      const duration = performance.now() - start

      expect(result).toMatch(/^data:application\/octet-stream;base64,/)
      // Should complete in under 100ms for 100KB
      expect(duration).toBeLessThan(100)
    })
  })

  describe('round-trip conversion', () => {
    it('should produce data URL that can be used in img src', async () => {
      // Small test image data (1x1 red pixel PNG)
      const pngData = new Uint8Array([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
        0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
        0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1
        0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, // 8-bit RGB
        0xDE // Checksum
      ])
      const blob = new Blob([pngData], { type: 'image/png' })
      const dataUrl = await convertBlobToBase64(blob)

      // Verify it's a valid data URL for images
      expect(dataUrl).toMatch(/^data:image\/png;base64,/)

      // Verify the structure is correct
      const [header, base64Data] = dataUrl.split(',')
      expect(header).toBe('data:image/png;base64')
      expect(base64Data.length).toBeGreaterThan(0)
    })
  })
})
