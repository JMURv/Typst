#!/bin/bash
echo "Stop containers"
echo pwd
echo 'I AM HERE'
cd typst
docker-compose down

docker image rm jmurv/typst-backend
docker image rm jmurv/typst-frontend
docker image rm jmurv/typst-recommends

echo "Pull image"
docker pull jmurv/typst-backend
docker pull jmurv/typst-frontend
docker pull jmurv/typst-recommends

echo "Start typst containers"
docker-compose up

echo "Finish deploying!"