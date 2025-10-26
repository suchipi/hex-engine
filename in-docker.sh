#!/usr/bin/env bash
set -e

mkdir -p node_modules/.docker
docker run --rm -it \
  -v "$PWD:/hex-engine" \
  -v "$PWD/node_modules/.docker:/hex-engine/node_modules" \
    suchipi/node-nw-env:0.7.0 \
      bash -c \
        "Xvfb -screen 0 1024x768x16 -ac & source /usr/local/nvm/nvm.sh && cd /hex-engine && nvm install && nvm use && $*"
