#!/usr/bin/env bash
set -e

export PATH="./node_modules/.bin:$PATH"

./scripts/build-core.sh
./scripts/build-inspector.sh
./scripts/build-2d.sh

concurrently \
  'chokidar "packages/core/src/**/*" -c "./scripts/build-core.sh"'\
  'chokidar "packages/2d/src/**/*" -c "./scripts/build-2d.sh"'\
  'chokidar "packages/inspector/src/**/*" -c "./scripts/build-inspector.sh"'\
  'webpack-dev-server --mode development'
