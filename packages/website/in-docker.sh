#!/usr/bin/env fish
# local fish version at time of writing was 3.6.1

cd (dirname (status --current-filename))

set -l tty_arg ''
if isatty 0 # stdin
  set tty_arg '-it'
end

set -l node_version (string replace 'v' '' (cat ../../.node-version))

mkdir -p ./node_modules/.docker

docker run --rm $tty_arg \
  -p 3000:3000 \
  -v "$PWD":/app -w /app \
  -v "$PWD"/node_modules/.docker:/app/node_modules \
  node:$node_version \
  bash -c "$argv"
