#!/usr/bin/env bash
set -e

export PATH="./node_modules/.bin:../node_modules/.bin:../../node_modules/.bin:$PATH"

cd packages/core
babel --extensions '.ts,.tsx,.js,.jsx' --config-file ../../babel.config.js src --out-dir dist
cd ../..
