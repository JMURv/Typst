#!/bin/bash
echo "Stop containers"
docker-compose down

echo "Deleting containers, images and volumes"
docker rm "$(docker ps -q -f status=exited)"

docker image rm typst-backend
docker image rm typst-frontend
docker image rm typst-recommends

docker volume rm "$(docker volume ls -q --filter dangling=true)"
docker volume rm node_modules_typst

echo "Pull changes"
git pull origin main

echo "Start typst containers"
docker-compose build --no-cache
docker-compose up -d

echo "Finish deploying!"