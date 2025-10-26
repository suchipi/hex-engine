#!/usr/bin/env bash
set -e

# move to root dir
cd $(dirname "$BASH_SOURCE")
cd ..

npx --no-install concurrently --names \
  '2d,core,create,inspector,scripts,game,website' \
  'bash -c "cd packages/2d && npm run watch"' \
  'bash -c "cd packages/core && npm run watch"' \
  'bash -c "cd packages/create && npm run watch"' \
  'bash -c "cd packages/inspector && npm run watch"' \
  'bash -c "cd packages/scripts && npm run watch"' \
  'bash -c "cd packages/game && npm run watch"' \
  'bash -c "cd packages/website && npm run watch"'
