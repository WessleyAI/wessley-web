import { Resend } from 'resend'

/**
 * Email service for transactional emails using Resend
 *
 * Used for:
 * - Dunning emails (payment failures)
 * - Subscription cancellation notifications
 * - Welcome emails
 */

const APP_NAME = 'Wessley.ai'

/**
 * Get the Resend client lazily to avoid instantiation errors during build
 * Returns null if RESEND_API_KEY is not configured
 */
function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return null
  }
  return new Resend(apiKey)
}

function getFromEmail(): string {
  return process.env.RESEND_FROM_EMAIL || 'noreply@wessley.ai'
}

function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || 'https://wessley.ai'
}

export interface SendEmailResult {
  success: boolean
  id?: string
  error?: string
}

/**
 * Send a payment failed (dunning) email
 * Notifies the user their payment failed and provides a link to update payment info
 */
export async function sendPaymentFailedEmail(
  to: string,
  data: {
    customerName?: string
    nextRetryDate?: Date
    updatePaymentUrl: string
  }
): Promise<SendEmailResult> {
  const resend = getResendClient()
  if (!resend) {
    console.error('[Email] RESEND_API_KEY not configured - skipping email')
    return { success: false, error: 'Email service not configured' }
  }

  const { customerName, nextRetryDate, updatePaymentUrl } = data
  const greeting = customerName ? `Hi ${customerName}` : 'Hi there'
  const retryInfo = nextRetryDate
    ? `We'll automatically retry your payment on ${nextRetryDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })}.`
    : 'We\'ll automatically retry your payment soon.'

  const fromEmail = getFromEmail()
  const appUrl = getAppUrl()

  try {
    const result = await resend.emails.send({
      from: `${APP_NAME} <${fromEmail}>`,
      to,
      subject: 'Action Required: Payment Failed for Your Wessley.ai Subscription',
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; padding: 20px 0; border-bottom: 2px solid #8BE196; }
    .logo { font-size: 24px; font-weight: bold; color: #161616; }
    .logo span { color: #8BE196; }
    .content { padding: 30px 0; }
    .alert { background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; margin: 20px 0; border-radius: 4px; }
    .button { display: inline-block; background: #8BE196; color: #161616; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
    .button:hover { background: #7BD185; }
    .footer { text-align: center; padding: 20px 0; border-top: 1px solid #E5E5E5; font-size: 14px; color: #666; }
    .footer a { color: #8BE196; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">Wessley<span>.ai</span></div>
  </div>
  <div class="content">
    <p>${greeting},</p>

    <div class="alert">
      <strong>Your recent payment was unsuccessful.</strong>
    </div>

    <p>We weren't able to process your subscription payment. This may be due to:</p>
    <ul>
      <li>Expired card</li>
      <li>Insufficient funds</li>
      <li>Card declined by your bank</li>
    </ul>

    <p>${retryInfo}</p>

    <p>To avoid any interruption to your service, please update your payment method:</p>

    <p style="text-align: center;">
      <a href="${updatePaymentUrl}" class="button">Update Payment Method</a>
    </p>

    <p>Your subscription will remain active during this time, but if we can't process your payment after several attempts, your access may be interrupted.</p>

    <p>If you have any questions or need help, just reply to this email.</p>

    <p>Thanks,<br>The Wessley.ai Team</p>
  </div>
  <div class="footer">
    <p>&copy; ${new Date().getFullYear()} Wessley.ai. All rights reserved.</p>
    <p><a href="${appUrl}">wessley.ai</a></p>
  </div>
</body>
</html>
      `,
      tags: [
        { name: 'category', value: 'dunning' },
        { name: 'type', value: 'payment_failed' },
      ],
    })

    if (result.error) {
      console.error('[Email] Failed to send payment failed email:', result.error)
      return { success: false, error: result.error.message }
    }

    return { success: true, id: result.data?.id }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[Email] Error sending payment failed email:', message)
    return { success: false, error: message }
  }
}

/**
 * Send subscription cancelled email
 * Sent when subscription is cancelled (either by user or after failed payment retries)
 */
export async function sendSubscriptionCancelledEmail(
  to: string,
  data: {
    customerName?: string
    reactivateUrl: string
    reason?: 'user_cancelled' | 'payment_failed' | 'admin'
  }
): Promise<SendEmailResult> {
  const resend = getResendClient()
  if (!resend) {
    console.error('[Email] RESEND_API_KEY not configured - skipping email')
    return { success: false, error: 'Email service not configured' }
  }

  const { customerName, reactivateUrl, reason = 'user_cancelled' } = data
  const greeting = customerName ? `Hi ${customerName}` : 'Hi there'

  const reasonText =
    reason === 'payment_failed'
      ? 'Unfortunately, we were unable to process your payment after several attempts, so your subscription has been cancelled.'
      : 'Your Wessley.ai subscription has been cancelled.'

  const fromEmail = getFromEmail()
  const appUrl = getAppUrl()

  try {
    const result = await resend.emails.send({
      from: `${APP_NAME} <${fromEmail}>`,
      to,
      subject: "We're sorry to see you go - Wessley.ai",
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; padding: 20px 0; border-bottom: 2px solid #8BE196; }
    .logo { font-size: 24px; font-weight: bold; color: #161616; }
    .logo span { color: #8BE196; }
    .content { padding: 30px 0; }
    .button { display: inline-block; background: #8BE196; color: #161616; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
    .button:hover { background: #7BD185; }
    .footer { text-align: center; padding: 20px 0; border-top: 1px solid #E5E5E5; font-size: 14px; color: #666; }
    .footer a { color: #8BE196; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">Wessley<span>.ai</span></div>
  </div>
  <div class="content">
    <p>${greeting},</p>

    <p>${reasonText}</p>

    <p>We hope Wessley.ai has been helpful in diagnosing and understanding your vehicle's electrical systems. Your data and vehicle projects will be saved for 30 days in case you decide to come back.</p>

    <p>If you'd like to reactivate your subscription at any time, you can do so here:</p>

    <p style="text-align: center;">
      <a href="${reactivateUrl}" class="button">Reactivate Subscription</a>
    </p>

    <p>We'd love to hear your feedback on how we can improve. Feel free to reply to this email with any thoughts.</p>

    <p>Thanks for being a part of Wessley.ai,<br>The Wessley.ai Team</p>
  </div>
  <div class="footer">
    <p>&copy; ${new Date().getFullYear()} Wessley.ai. All rights reserved.</p>
    <p><a href="${appUrl}">wessley.ai</a></p>
  </div>
</body>
</html>
      `,
      tags: [
        { name: 'category', value: 'lifecycle' },
        { name: 'type', value: 'subscription_cancelled' },
      ],
    })

    if (result.error) {
      console.error('[Email] Failed to send subscription cancelled email:', result.error)
      return { success: false, error: result.error.message }
    }

    return { success: true, id: result.data?.id }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[Email] Error sending subscription cancelled email:', message)
    return { success: false, error: message }
  }
}
