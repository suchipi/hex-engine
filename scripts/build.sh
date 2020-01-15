#!/usr/bin/env bash
set -e

export PATH="./node_modules/.bin:../node_modules/.bin:../../node_modules/.bin:$PATH"

cd packages/core
yarn build
cd ../..

cd packages/inspector
yarn build
cd ../..

cd packages/2d
yarn build
cd ../..

cd packages/game
yarn build
cd ../..
