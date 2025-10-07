# Netlify Deployment Instructions

## Configuration

This project is configured to work with Netlify using dashboard settings (no netlify.toml file).

### Required Netlify Dashboard Settings

Set these in your Netlify dashboard:

- **Build command**: `npm install && npm run build`
- **Publish directory**: `dist`
- **Node version**: `18`

## Files Included for SPA Support

- `_redirects` - Handles client-side routing (in `public/` and copied to `dist/`)
- `.nvmrc` - Node.js version specification

## Troubleshooting

1. **404 errors on routes**: The `_redirects` file handles client-side routing
2. **Build fails with "vite not found"**: Vite is in dependencies, should install correctly
3. **Wrong publish directory**: Ensure publish directory is set to `dist` (not `dist/dist`)

## Local Testing

To test the build locally:
```bash
npm run build
```

This will build the project and include the `_redirects` file for SPA support.
