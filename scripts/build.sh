#!/usr/bin/env bash
set -e

export PATH="./node_modules/.bin:../node_modules/.bin:../../node_modules/.bin:$PATH"

./scripts/build-core.sh
./scripts/build-inspector.sh
./scripts/build-2d.sh

cd packages/game
env NODE_ENV=production webpack --mode production
cd ../..
