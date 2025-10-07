#!/bin/bash

echo "Starting Netlify build process..."

echo "Installing dependencies..."
npm install --production=false

echo "Building application..."
npm run build

echo "Build completed successfully!"
echo "Contents of dist directory:"
ls -la dist/

echo "Build process finished."
