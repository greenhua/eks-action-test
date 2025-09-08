#!/bin/bash
set -e
set -x
echo "Starting Cypress tests..."

npm run test

echo "Uploading to ReportPortal..."
npm run upload-rp

echo "All tasks completed successfully!"
