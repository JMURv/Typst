#!/bin/bash
echo "Stop containers"
docker-compose down

echo "Deleting containers, images and volumes"
docker rm "$(docker ps -q -f status=exited)"

docker rmi typst_backend:latest
docker rmi typst_frontend:latest
docker rmi typst_recommends:latest

docker volume rm typst_node_modules_typst

echo "Pull changes"
git add .
git commit -am "pull changes"
git checkout origin/main
git pull origin main

echo "Start typst containers"
docker-compose build --no-cache
docker-compose up -d

echo "Finish deploying!"