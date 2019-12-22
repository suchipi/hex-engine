#!/usr/bin/env bash
set -e

export PATH="./node_modules/.bin:../node_modules/.bin:../../node_modules/.bin:$PATH"

./scripts/build-engine.sh

cd packages/game
webpack --config ../../webpack.config.js --mode production
cd ../..
