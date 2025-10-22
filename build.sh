#!/bin/bash
set -e

echo "Installing dependencies..."
npm install --production=false

echo "Building application..."
npm run build

echo "Build completed successfully!"

