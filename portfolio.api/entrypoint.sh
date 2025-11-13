#!/bin/bash
set -e

echo "Starting Portfolio API..."

# Run the application
exec dotnet Portfolio.Api.dll "$@"
