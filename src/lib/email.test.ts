import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('email service', () => {
  const originalEnv = process.env
  let mockSend: ReturnType<typeof vi.fn>

  beforeEach(async () => {
    vi.resetModules()
    process.env = { ...originalEnv }

    // Create a new mock for each test
    mockSend = vi.fn()

    // Mock Resend before importing
    vi.doMock('resend', () => ({
      Resend: class MockResend {
        emails = {
          send: mockSend,
        }
      },
    }))
  })

  afterEach(() => {
    process.env = originalEnv
    vi.doUnmock('resend')
  })

  describe('sendPaymentFailedEmail', () => {
    it('should return error when RESEND_API_KEY is not configured', async () => {
      delete process.env.RESEND_API_KEY
      const { sendPaymentFailedEmail } = await import('./email')

      const result = await sendPaymentFailedEmail('test@example.com', {
        updatePaymentUrl: 'https://example.com/update',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Email service not configured')
    })

    it('should send email when API key is configured', async () => {
      process.env.RESEND_API_KEY = 're_test_key'
      process.env.RESEND_FROM_EMAIL = 'test@wessley.ai'
      process.env.NEXT_PUBLIC_APP_URL = 'https://wessley.ai'

      mockSend.mockResolvedValue({
        data: { id: 'email_123' },
        error: null,
      })

      const { sendPaymentFailedEmail } = await import('./email')

      const result = await sendPaymentFailedEmail('user@example.com', {
        customerName: 'John Doe',
        nextRetryDate: new Date('2026-01-25'),
        updatePaymentUrl: 'https://example.com/portal',
      })

      expect(result.success).toBe(true)
      expect(result.id).toBe('email_123')
    })

    it('should handle email without customer name', async () => {
      process.env.RESEND_API_KEY = 're_test_key'

      mockSend.mockResolvedValue({
        data: { id: 'email_456' },
        error: null,
      })

      const { sendPaymentFailedEmail } = await import('./email')

      const result = await sendPaymentFailedEmail('user@example.com', {
        updatePaymentUrl: 'https://example.com/portal',
      })

      expect(result.success).toBe(true)
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('Hi there'),
        })
      )
    })

    it('should include customer name in greeting when provided', async () => {
      process.env.RESEND_API_KEY = 're_test_key'

      mockSend.mockResolvedValue({
        data: { id: 'email_457' },
        error: null,
      })

      const { sendPaymentFailedEmail } = await import('./email')

      await sendPaymentFailedEmail('user@example.com', {
        customerName: 'John Doe',
        updatePaymentUrl: 'https://example.com/portal',
      })

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('Hi John Doe'),
        })
      )
    })

    it('should handle Resend API errors', async () => {
      process.env.RESEND_API_KEY = 're_test_key'

      mockSend.mockResolvedValue({
        data: null,
        error: { message: 'Invalid API key' },
      })

      const { sendPaymentFailedEmail } = await import('./email')

      const result = await sendPaymentFailedEmail('user@example.com', {
        updatePaymentUrl: 'https://example.com/portal',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid API key')
    })

    it('should handle network errors', async () => {
      process.env.RESEND_API_KEY = 're_test_key'

      mockSend.mockRejectedValue(new Error('Network error'))

      const { sendPaymentFailedEmail } = await import('./email')

      const result = await sendPaymentFailedEmail('user@example.com', {
        updatePaymentUrl: 'https://example.com/portal',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Network error')
    })

    it('should use correct subject line', async () => {
      process.env.RESEND_API_KEY = 're_test_key'

      mockSend.mockResolvedValue({
        data: { id: 'email_789' },
        error: null,
      })

      const { sendPaymentFailedEmail } = await import('./email')

      await sendPaymentFailedEmail('user@example.com', {
        updatePaymentUrl: 'https://example.com/portal',
      })

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: 'Action Required: Payment Failed for Your Wessley.ai Subscription',
        })
      )
    })

    it('should include dunning tags', async () => {
      process.env.RESEND_API_KEY = 're_test_key'

      mockSend.mockResolvedValue({
        data: { id: 'email_tags' },
        error: null,
      })

      const { sendPaymentFailedEmail } = await import('./email')

      await sendPaymentFailedEmail('user@example.com', {
        updatePaymentUrl: 'https://example.com/portal',
      })

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          tags: [
            { name: 'category', value: 'dunning' },
            { name: 'type', value: 'payment_failed' },
          ],
        })
      )
    })

    it('should use generic retry message when no date provided', async () => {
      process.env.RESEND_API_KEY = 're_test_key'

      mockSend.mockResolvedValue({
        data: { id: 'email_noretry' },
        error: null,
      })

      const { sendPaymentFailedEmail } = await import('./email')

      await sendPaymentFailedEmail('user@example.com', {
        updatePaymentUrl: 'https://example.com/portal',
      })

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('retry your payment soon'),
        })
      )
    })
  })

  describe('sendSubscriptionCancelledEmail', () => {
    it('should return error when RESEND_API_KEY is not configured', async () => {
      delete process.env.RESEND_API_KEY
      const { sendSubscriptionCancelledEmail } = await import('./email')

      const result = await sendSubscriptionCancelledEmail('test@example.com', {
        reactivateUrl: 'https://example.com/pricing',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Email service not configured')
    })

    it('should send email when API key is configured', async () => {
      process.env.RESEND_API_KEY = 're_test_key'
      process.env.RESEND_FROM_EMAIL = 'test@wessley.ai'
      process.env.NEXT_PUBLIC_APP_URL = 'https://wessley.ai'

      mockSend.mockResolvedValue({
        data: { id: 'email_abc' },
        error: null,
      })

      const { sendSubscriptionCancelledEmail } = await import('./email')

      const result = await sendSubscriptionCancelledEmail('user@example.com', {
        customerName: 'Jane Doe',
        reactivateUrl: 'https://example.com/pricing',
        reason: 'user_cancelled',
      })

      expect(result.success).toBe(true)
      expect(result.id).toBe('email_abc')
    })

    it('should send email with payment_failed reason', async () => {
      process.env.RESEND_API_KEY = 're_test_key'

      mockSend.mockResolvedValue({
        data: { id: 'email_def' },
        error: null,
      })

      const { sendSubscriptionCancelledEmail } = await import('./email')

      const result = await sendSubscriptionCancelledEmail('user@example.com', {
        reactivateUrl: 'https://example.com/pricing',
        reason: 'payment_failed',
      })

      expect(result.success).toBe(true)
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('unable to process your payment'),
        })
      )
    })

    it('should handle email without customer name', async () => {
      process.env.RESEND_API_KEY = 're_test_key'

      mockSend.mockResolvedValue({
        data: { id: 'email_ghi' },
        error: null,
      })

      const { sendSubscriptionCancelledEmail } = await import('./email')

      const result = await sendSubscriptionCancelledEmail('user@example.com', {
        reactivateUrl: 'https://example.com/pricing',
      })

      expect(result.success).toBe(true)
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('Hi there'),
        })
      )
    })

    it('should include customer name in greeting when provided', async () => {
      process.env.RESEND_API_KEY = 're_test_key'

      mockSend.mockResolvedValue({
        data: { id: 'email_name' },
        error: null,
      })

      const { sendSubscriptionCancelledEmail } = await import('./email')

      await sendSubscriptionCancelledEmail('user@example.com', {
        customerName: 'Jane Doe',
        reactivateUrl: 'https://example.com/pricing',
      })

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('Hi Jane Doe'),
        })
      )
    })

    it('should handle Resend API errors', async () => {
      process.env.RESEND_API_KEY = 're_test_key'

      mockSend.mockResolvedValue({
        data: null,
        error: { message: 'Rate limit exceeded' },
      })

      const { sendSubscriptionCancelledEmail } = await import('./email')

      const result = await sendSubscriptionCancelledEmail('user@example.com', {
        reactivateUrl: 'https://example.com/pricing',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Rate limit exceeded')
    })

    it('should handle network errors', async () => {
      process.env.RESEND_API_KEY = 're_test_key'

      mockSend.mockRejectedValue(new Error('Connection refused'))

      const { sendSubscriptionCancelledEmail } = await import('./email')

      const result = await sendSubscriptionCancelledEmail('user@example.com', {
        reactivateUrl: 'https://example.com/pricing',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Connection refused')
    })

    it('should use correct subject line', async () => {
      process.env.RESEND_API_KEY = 're_test_key'

      mockSend.mockResolvedValue({
        data: { id: 'email_jkl' },
        error: null,
      })

      const { sendSubscriptionCancelledEmail } = await import('./email')

      await sendSubscriptionCancelledEmail('user@example.com', {
        reactivateUrl: 'https://example.com/pricing',
      })

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: "We're sorry to see you go - Wessley.ai",
        })
      )
    })

    it('should include lifecycle tags', async () => {
      process.env.RESEND_API_KEY = 're_test_key'

      mockSend.mockResolvedValue({
        data: { id: 'email_mno' },
        error: null,
      })

      const { sendSubscriptionCancelledEmail } = await import('./email')

      await sendSubscriptionCancelledEmail('user@example.com', {
        reactivateUrl: 'https://example.com/pricing',
      })

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          tags: [
            { name: 'category', value: 'lifecycle' },
            { name: 'type', value: 'subscription_cancelled' },
          ],
        })
      )
    })

    it('should include reactivate URL in email', async () => {
      process.env.RESEND_API_KEY = 're_test_key'

      mockSend.mockResolvedValue({
        data: { id: 'email_url' },
        error: null,
      })

      const { sendSubscriptionCancelledEmail } = await import('./email')

      await sendSubscriptionCancelledEmail('user@example.com', {
        reactivateUrl: 'https://wessley.ai/pricing',
      })

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('https://wessley.ai/pricing'),
        })
      )
    })

    it('should use user_cancelled as default reason', async () => {
      process.env.RESEND_API_KEY = 're_test_key'

      mockSend.mockResolvedValue({
        data: { id: 'email_default' },
        error: null,
      })

      const { sendSubscriptionCancelledEmail } = await import('./email')

      await sendSubscriptionCancelledEmail('user@example.com', {
        reactivateUrl: 'https://example.com/pricing',
      })

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('has been cancelled'),
        })
      )
    })
  })
})
