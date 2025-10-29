# Netlify Deployment Guide

## Quick Deploy

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/yourusername/wessley.ai)

## Manual Deployment Steps

### 1. Fork/Clone Repository
```bash
git clone https://github.com/yourusername/wessley.ai.git
cd wessley.ai
```

### 2. Environment Variables
Set these in your Netlify dashboard under Site settings > Environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
BEEHIIV_API_KEY=your_beehiiv_api_key
BEEHIIV_PUBLICATION_ID=your_beehiiv_publication_id
```

### 3. Build Settings
In Netlify dashboard:
- **Base directory**: `apps/web`
- **Build command**: `npm run build`
- **Publish directory**: `apps/web/.next`

### 4. Deploy
The app will automatically deploy when you push to the connected branch.

## Key Configuration

### Build Optimizations
- ESLint errors are ignored during build (`NEXT_IGNORE_ESLINT=true`)
- TypeScript errors are ignored during build (`ignoreBuildErrors: true`)
- Images are unoptimized for static export
- Webpack fallbacks configured for browser compatibility

### Redirects
All routes redirect to the homepage waitlist due to the app rewiring.

### Performance
- Static assets cached for 1 year
- Security headers included
- Optimized for fast loading

## Troubleshooting

### Common Build Issues
1. **Dependency errors**: Make sure all dependencies are in package.json
2. **Environment variables**: Check they're set correctly in Netlify dashboard
3. **Build timeout**: Contact Netlify support if builds take longer than 15 minutes

### Runtime Issues
1. **API routes not working**: This is a static export, API routes won't work
2. **Images not loading**: Check that images are in the public folder
3. **Routing issues**: All routes redirect to homepage by design

## Support
For deployment issues, check:
1. Netlify build logs
2. Browser console for runtime errors
3. Network tab for failed API calls