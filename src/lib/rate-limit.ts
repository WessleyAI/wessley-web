import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

/**
 * Rate limiting configuration for API endpoints.
 *
 * Uses Upstash Redis for distributed rate limiting across serverless instances.
 * Rate limits are per-user (authenticated) or per-IP (unauthenticated/demo).
 *
 * Rate limits per spec (specs/api-contracts.md):
 * - /api/chat: 60 req/min
 * - /api/ingest: 10 req/hour
 * - /api/netlistify: 30 req/min
 */

// Check if Upstash is configured
const isUpstashConfigured = () => {
  return !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
}

// Create Redis client only if configured
const getRedis = () => {
  if (!isUpstashConfigured()) {
    return null
  }
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  })
}

// Rate limiter for chat endpoints: 60 requests per minute
export const chatRatelimit = (() => {
  const redis = getRedis()
  if (!redis) return null

  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(60, "1 m"),
    analytics: true,
    prefix: "ratelimit:chat",
  })
})()

// Rate limiter for ingest endpoint: 10 requests per hour (more restrictive)
export const ingestRatelimit = (() => {
  const redis = getRedis()
  if (!redis) return null

  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "1 h"),
    analytics: true,
    prefix: "ratelimit:ingest",
  })
})()

// Rate limiter for netlistify ML endpoint: 30 requests per minute
export const netlistifyRatelimit = (() => {
  const redis = getRedis()
  if (!redis) return null

  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, "1 m"),
    analytics: true,
    prefix: "ratelimit:netlistify",
  })
})()

// Rate limiter for waitlist: 5 requests per minute (prevent spam)
export const waitlistRatelimit = (() => {
  const redis = getRedis()
  if (!redis) return null

  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "1 m"),
    analytics: true,
    prefix: "ratelimit:waitlist",
  })
})()

/**
 * Rate limit response type
 */
export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

/**
 * Apply rate limiting to an API request.
 *
 * @param ratelimit - The rate limiter to use
 * @param identifier - User ID (authenticated) or IP address (unauthenticated)
 * @returns RateLimitResult with success status and metadata
 */
export async function checkRateLimit(
  ratelimit: Ratelimit | null,
  identifier: string
): Promise<RateLimitResult> {
  // If rate limiting is not configured in production, deny requests for security
  // In development mode, allow requests but log a warning
  if (!ratelimit) {
    const isProduction = process.env.NODE_ENV === "production"

    if (isProduction) {
      console.error(
        "[SECURITY] Rate limiting not configured in production. " +
        "Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to enable rate limiting."
      )
      return {
        success: false,
        limit: 0,
        remaining: 0,
        reset: Date.now() + 60000,
      }
    }

    // Development mode: warn but allow (for local testing)
    console.warn(
      "[WARN] Rate limiting not configured. Requests are not rate limited in development. " +
      "Configure UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN for production."
    )
    return {
      success: true,
      limit: -1,
      remaining: -1,
      reset: -1,
    }
  }

  const { success, limit, remaining, reset } = await ratelimit.limit(identifier)

  return {
    success,
    limit,
    remaining,
    reset,
  }
}

/**
 * Get identifier for rate limiting based on user auth status.
 * Uses user ID for authenticated users, IP address for unauthenticated.
 *
 * @param userId - Authenticated user ID (optional)
 * @param request - Next.js request object for IP extraction
 * @returns Identifier string for rate limiting
 */
export function getRateLimitIdentifier(
  userId: string | undefined,
  request: Request
): string {
  if (userId) {
    return `user:${userId}`
  }

  // Extract IP from headers (works with Vercel, Cloudflare, etc.)
  const forwardedFor = request.headers.get("x-forwarded-for")
  const realIp = request.headers.get("x-real-ip")
  const ip = forwardedFor?.split(",")[0] || realIp || "anonymous"

  return `ip:${ip}`
}

/**
 * Create a rate limit exceeded response with proper headers.
 *
 * @param result - Rate limit result from checkRateLimit
 * @returns Response object with 429 status and retry-after header
 */
export function createRateLimitResponse(result: RateLimitResult): Response {
  const retryAfter = Math.ceil((result.reset - Date.now()) / 1000)

  return new Response(
    JSON.stringify({
      error: "rate_limited",
      message: "Too many requests. Please try again later.",
      retry_after: retryAfter,
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "X-RateLimit-Limit": result.limit.toString(),
        "X-RateLimit-Remaining": result.remaining.toString(),
        "X-RateLimit-Reset": result.reset.toString(),
        "Retry-After": retryAfter.toString(),
      },
    }
  )
}

/**
 * Add rate limit headers to a successful response.
 *
 * @param response - Original response
 * @param result - Rate limit result
 * @returns Response with rate limit headers added
 */
export function addRateLimitHeaders(
  response: Response,
  result: RateLimitResult
): Response {
  // If rate limiting not configured, return original response
  if (result.limit === -1) {
    return response
  }

  const newHeaders = new Headers(response.headers)
  newHeaders.set("X-RateLimit-Limit", result.limit.toString())
  newHeaders.set("X-RateLimit-Remaining", result.remaining.toString())
  newHeaders.set("X-RateLimit-Reset", result.reset.toString())

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  })
}
