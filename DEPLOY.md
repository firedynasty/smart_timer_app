# Deployment Guide for Vercel

This project is configured for easy deployment on Vercel. Follow these steps to deploy:

## Prerequisites

1. Make sure you have a Vercel account
2. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

## Deployment Steps

1. **Login to Vercel**:
   ```bash
   vercel login
   ```

2. **Link your project**:
   ```bash
   vercel link
   ```

3. **Deploy to Vercel**:
   ```bash
   vercel --prod
   ```

## What's Been Set Up

The following files have been created or modified to enable Vercel deployment:

1. **vercel.json** - Configuration for Vercel deployment
2. **index.js** - Express server for serving the app and handling API routes
3. **api/data.js** - Serverless API route for data handling
4. **scripts/verify-build.js** - Script to verify build output
5. **package.json** - Added scripts and dependencies for Vercel

## GitHub Integration

For automatic deployment with GitHub:

1. Push this repository to GitHub
2. Connect Vercel to your GitHub repository
3. Each push to the main branch will trigger a deployment

## Troubleshooting

If you encounter issues:

1. Check the Vercel deployment logs
2. Verify that JSON files are being copied correctly from public to build directory
3. Run `npm run verify-build` locally to inspect the build output
4. Use the `/api/list-files` endpoint to check file availability in production

Created: 2025-05-15