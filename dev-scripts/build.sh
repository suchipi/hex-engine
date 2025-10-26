#!/usr/bin/env bash
set -e

# move to root dir
cd $(dirname "$BASH_SOURCE")
cd ..

echo "===== packages/2d ====="
pushd packages/2d > /dev/null
  npm run build
popd > /dev/null

echo "===== packages/core ====="
pushd packages/core > /dev/null
  npm run build
popd > /dev/null

echo "===== packages/create ====="
pushd packages/create > /dev/null
  npm run build
popd > /dev/null

echo "===== packages/inspector ====="
pushd packages/inspector > /dev/null
  npm run build
popd > /dev/null

echo "===== packages/scripts ====="
pushd packages/scripts > /dev/null
  npm run build
popd > /dev/null

echo "===== packages/game ====="
pushd packages/game > /dev/null
  npm run build
popd > /dev/null

echo "===== packages/website ====="
pushd packages/website > /dev/null
  # npm run build
  echo skipping...
popd > /dev/null
