# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into your wessley.ai Next.js 15.5.7 project. The integration includes:

- **Client-side analytics** via `instrumentation-client.ts` for automatic pageviews, session replay, and error tracking
- **Server-side analytics** via `posthog-node` for API route tracking
- **Reverse proxy** configured in `next.config.js` for improved tracking reliability
- **User identification** on login (server-side) and onboarding completion (client-side)
- **Error tracking** with `posthog.captureException()` for catching and reporting errors

## Files Created/Modified

### New Files
| File | Purpose |
|------|---------|
| `instrumentation-client.ts` | Client-side PostHog initialization for Next.js 15.3+ |
| `src/lib/posthog-server.ts` | Server-side PostHog client singleton |
| `.env.local` (modified) | Added `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST` |
| `next.config.js` (modified) | Added PostHog reverse proxy rewrites |

### Event Tracking

| Event Name | Description | File |
|------------|-------------|------|
| `waitlist_joined` | User successfully joins the waitlist | `src/app/page.tsx` |
| `auth_login_completed` | User successfully authenticates via OAuth | `src/app/auth/callback/route.ts` |
| `onboarding_completed` | User completes the setup/onboarding flow | `src/app/setup/page.tsx` |
| `chat_message_sent` | User sends a message in the AI chat | `src/app/api/chat/messages/route.ts` |
| `chat_created` | User starts a new chat conversation | `src/components/chat/chat-helpers/index.ts` |
| `chat_deleted` | User deletes a chat conversation | `src/components/sidebar/items/chat/delete-chat.tsx` |
| `chat_item_clicked` | User clicks on a chat item to navigate | `src/components/sidebar/items/chat/chat-item.tsx` |
| `assistant_created` | User creates a custom AI assistant | `src/components/sidebar/items/all/sidebar-create-item.tsx` |
| `file_uploaded` | User uploads a file for AI context | `src/components/sidebar/items/all/sidebar-create-item.tsx` |
| `marketplace_part_selected` | User adds a part to cart in marketplace | `src/components/waitlist/marketplace/buy-section.tsx` |
| `marketplace_comparison_opened` | User opens price comparison drawer | `src/components/waitlist/marketplace/buy-section.tsx` |
| `api_error_occurred` | API error occurs during processing | `src/app/api/chat/messages/route.ts` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

### Dashboard
- [Analytics basics](https://us.posthog.com/project/281436/dashboard/1006408) - Core analytics dashboard with all insights

### Insights
- [User Acquisition Funnel](https://us.posthog.com/project/281436/insights/ZEhaJ5hI) - Tracks user journey from waitlist signup through login to onboarding completion
- [Chat Engagement Trends](https://us.posthog.com/project/281436/insights/H1NLhIre) - Daily trends for chat creation, messages sent, and deletions
- [Feature Adoption](https://us.posthog.com/project/281436/insights/rgLpExw9) - Tracks adoption of key features: assistant creation, file uploads, and marketplace engagement
- [API Error Monitoring](https://us.posthog.com/project/281436/insights/OCx0NHsE) - Monitors API errors over time to track system reliability
- [Marketplace Engagement](https://us.posthog.com/project/281436/insights/VxoeWmYe) - Tracks marketplace interactions including part selections and price comparisons

## Environment Variables

Make sure these environment variables are set in your production environment:

```bash
NEXT_PUBLIC_POSTHOG_KEY=phc_kZ5ZgyFloKi5BbLDQFQJR0maICvBzEInKQ5HSMgZvoD
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```
