#!/bin/bash
echo "Stop containers"
docker-compose down

echo "Deleting images"
docker image rm typst-backend
docker image rm typst-frontend
docker image rm typst-recommends

echo "Pull changes"
git pull

echo "Start typst containers"
docker-compose up

echo "Finish deploying!"