#!/bin/bash

# Start Docker containers in the background
echo "Starting Docker containers..."
docker compose up -d

# Wait a moment for things to initialize
echo "Waiting for services to be ready..."
sleep 2

# Open browser based on OS
echo "Opening browser to http://localhost:3000"
if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
    start http://localhost:3000
    docker compose logs -f
elif [[ "$OSTYPE" == "darwin"* ]]; then
    open http://localhost:3000
    docker compose logs -f
else
    xdg-open http://localhost:3000 || echo "Please open http://localhost:3000 in your browser"
    docker compose logs -f
fi
