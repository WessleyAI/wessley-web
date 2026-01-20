import { describe, it, expect } from 'vitest'
import { cn, formatDate, getMediaTypeFromDataURL, getBase64FromDataURL } from './utils'

describe('cn - class name merger', () => {
  it('merges simple class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('handles conditional classes', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz')
  })

  it('handles undefined and null values', () => {
    expect(cn('foo', undefined, null, 'bar')).toBe('foo bar')
  })

  it('merges Tailwind classes correctly', () => {
    expect(cn('p-4', 'p-2')).toBe('p-2')
  })

  it('handles conflicting Tailwind classes', () => {
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
  })

  it('preserves non-conflicting Tailwind classes', () => {
    expect(cn('p-4', 'text-lg')).toBe('p-4 text-lg')
  })

  it('handles array inputs', () => {
    expect(cn(['foo', 'bar'])).toBe('foo bar')
  })

  it('handles object inputs', () => {
    expect(cn({ foo: true, bar: false, baz: true })).toBe('foo baz')
  })
})

describe('formatDate', () => {
  it('formats date string correctly', () => {
    const result = formatDate('2024-03-15')
    expect(result).toBe('March 15, 2024')
  })

  it('formats Date object correctly', () => {
    const date = new Date(2024, 2, 15) // March 15, 2024
    const result = formatDate(date)
    expect(result).toBe('March 15, 2024')
  })

  it('formats timestamp correctly', () => {
    const timestamp = new Date(2024, 0, 1).getTime() // Jan 1, 2024
    const result = formatDate(timestamp)
    expect(result).toBe('January 1, 2024')
  })

  it('handles different months', () => {
    expect(formatDate('2024-06-01')).toBe('June 1, 2024')
    expect(formatDate('2024-12-25')).toBe('December 25, 2024')
  })
})

describe('getMediaTypeFromDataURL', () => {
  it('extracts image/png media type', () => {
    const dataURL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUg=='
    expect(getMediaTypeFromDataURL(dataURL)).toBe('image/png')
  })

  it('extracts image/jpeg media type', () => {
    const dataURL = 'data:image/jpeg;base64,/9j/4AAQSkZJRg=='
    expect(getMediaTypeFromDataURL(dataURL)).toBe('image/jpeg')
  })

  it('extracts application/pdf media type', () => {
    const dataURL = 'data:application/pdf;base64,JVBERi0xLjQ='
    expect(getMediaTypeFromDataURL(dataURL)).toBe('application/pdf')
  })

  it('returns null for invalid data URL', () => {
    expect(getMediaTypeFromDataURL('not-a-data-url')).toBeNull()
  })

  it('returns null for empty string', () => {
    expect(getMediaTypeFromDataURL('')).toBeNull()
  })

  it('returns null for missing base64 marker', () => {
    expect(getMediaTypeFromDataURL('data:image/png,abc123')).toBeNull()
  })
})

describe('getBase64FromDataURL', () => {
  it('extracts base64 content from PNG data URL', () => {
    const base64Content = 'iVBORw0KGgoAAAANSUhEUg=='
    const dataURL = `data:image/png;base64,${base64Content}`
    expect(getBase64FromDataURL(dataURL)).toBe(base64Content)
  })

  it('extracts base64 content from JPEG data URL', () => {
    const base64Content = '/9j/4AAQSkZJRg=='
    const dataURL = `data:image/jpeg;base64,${base64Content}`
    expect(getBase64FromDataURL(dataURL)).toBe(base64Content)
  })

  it('handles complex base64 content with special characters', () => {
    const base64Content = 'SGVsbG8gV29ybGQh+/='
    const dataURL = `data:text/plain;base64,${base64Content}`
    expect(getBase64FromDataURL(dataURL)).toBe(base64Content)
  })

  it('returns null for invalid data URL', () => {
    expect(getBase64FromDataURL('not-a-data-url')).toBeNull()
  })

  it('returns null for empty string', () => {
    expect(getBase64FromDataURL('')).toBeNull()
  })

  it('returns null for URL missing base64 marker', () => {
    expect(getBase64FromDataURL('data:image/png,abc123')).toBeNull()
  })
})
