#!/usr/bin/env bash
set -e

mkdir -p node_modules/.docker
docker run --rm -it -v "$PWD:/app" -v "$PWD/node_modules/.docker:/app/node_modules" suchipi/node-nw-env:0.5.2 bash -c "Xvfb -screen 0 1024x768x16 -ac & source /usr/local/nvm/nvm.sh && cd /app && nvm use && $*"
