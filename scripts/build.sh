#!/usr/bin/env bash
set -e

export PATH="./node_modules/.bin:../node_modules/.bin:../../node_modules/.bin:$PATH"

./scripts/build-core.sh
./scripts/build-engine.sh
./scripts/build-inspector.sh

cd packages/game
webpack --mode production
cd ../..
