# Netlify Deployment Instructions

## Quick Fix for Build Issues

If you're experiencing build failures on Netlify, try these solutions in order:

### Option 1: Use the provided build script
The `netlify.toml` is configured to use `npm run build:netlify` which handles dependency installation and building.

### Option 2: Manual Netlify Configuration
If the automatic configuration doesn't work, set these in your Netlify dashboard:

- **Build command**: `npm run build:netlify`
- **Publish directory**: `dist`
- **Node version**: `18`

### Option 3: Alternative Build Command
If the above doesn't work, try:
- **Build command**: `npm install && npm run build`
- **Publish directory**: `dist`

## Files Included for SPA Support

- `_redirects` - Handles client-side routing
- `netlify.toml` - Build configuration
- `.nvmrc` - Node.js version specification

## Troubleshooting

1. **404 errors on routes**: Make sure `_redirects` file is in the `dist` folder
2. **Build fails with "vite not found"**: Vite is now in dependencies, not devDependencies
3. **Wrong publish directory**: Ensure publish directory is set to `dist` (not `dist/dist`)

## Local Testing

To test the build locally:
```bash
npm run build:netlify
```

This will install dependencies and build the project exactly as Netlify does.
