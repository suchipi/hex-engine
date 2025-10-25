#!/usr/bin/env bash
set -ex

# move to root dir
cd $(dirname "$BASH_SOURCE")
cd ..

BABEL_CONFIG_PATH="$(realpath ./babel.config.js)"

function run_babel() {
  npx --no-install babel --config-file "$BABEL_CONFIG_PATH" --extensions ".ts,.tsx,.js,.jsx" src -d dist --ignore '*.test.js'
}

echo "===== packages/2d ====="
pushd packages/2d
  run_babel
popd

echo "===== packages/core ====="
pushd packages/core
  run_babel
popd

echo "===== packages/create ====="
pushd packages/create
  run_babel
popd

echo "===== packages/inspector ====="
pushd packages/inspector
  run_babel
popd

echo "===== packages/scripts ====="
pushd packages/scripts
  run_babel
popd

echo "===== packages/game ====="
pushd packages/game
  npm run watch # &
popd

echo "===== packages/website ====="
pushd packages/website
  # npm run watch &
popd
