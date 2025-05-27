#!/bin/sh
ollama serve &

# Wait for server to be up
until curl -s http://localhost:11434 > /dev/null; do
  echo "Waiting for Ollama server..."
  sleep 2
done

# Only pull model after server is ready
ollama pull llama3

# Keep container alive (server already running in background)
tail -f /dev/null
