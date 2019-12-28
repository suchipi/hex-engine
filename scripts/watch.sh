#!/usr/bin/env bash
set -e

export PATH="./node_modules/.bin:$PATH"

./scripts/build-core.sh
./scripts/build-engine.sh
concurrently \
  'chokidar "packages/core/src/**/*" -c "./scripts/build-core.sh"'\
  'chokidar "packages/engine/src/**/*" -c "./scripts/build-engine.sh"'\
  'cd packages/game && webpack-dev-server --config ../../webpack.config.js --mode development'
