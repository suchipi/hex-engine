#!/usr/bin/env bash
set -e

export PATH="./node_modules/.bin:$PATH"

cd packages/core
yarn build
cd ../..

cd packages/inspector
yarn build
cd ../..

cd packages/2d
yarn build
cd ../..

concurrently \
  'cd packages/core && chokidar "src/**/*" -c "yarn build"'\
  'cd packages/2d && chokidar "src/**/*" -c "yarn build"'\
  'cd packages/inspector && chokidar "src/**/*" -c "yarn build"'\
  'webpack-dev-server --mode development'
