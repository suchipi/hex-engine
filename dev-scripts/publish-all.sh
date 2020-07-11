#!/bin/bash
set -e

cd packages

  cd core
    npm publish --access public
  cd ..

  cd inspector
    npm publish --access public
  cd ..

  cd 2d
    npm publish --access public
  cd ..

  cd scripts
    npm publish --access public
  cd ..

  cd create
    npm publish --access public
  cd ..

cd ..
