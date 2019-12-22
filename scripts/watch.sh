#!/usr/bin/env bash
set -e

export PATH="./node_modules/.bin:$PATH"

./scripts/build-engine.sh
concurrently 'chokidar "packages/engine/src/**/*" -c "./scripts/build-engine.sh"' 'cd packages/game && webpack-dev-server --config ../../webpack.config.js --mode development'
