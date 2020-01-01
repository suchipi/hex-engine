#!/usr/bin/env bash
set -e

export PATH="./node_modules/.bin:$PATH"

./scripts/build-core.sh
./scripts/build-engine.sh
./scripts/build-inspector.sh
concurrently \
  'chokidar "packages/core/src/**/*" -c "./scripts/build-core.sh"'\
  'chokidar "packages/engine/src/**/*" -c "./scripts/build-engine.sh"'\
  'chokidar "packages/inspector/src/**/*" -c "./scripts/build-inspector.sh"'\
  'webpack-dev-server --mode development'
