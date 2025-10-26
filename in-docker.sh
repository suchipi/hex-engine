#!/usr/bin/env fish
# local fish version at time of writing was 4.0.2

set fish_trace 1

cd (dirname (status --current-filename))

set -l rm_and_tty_arg '--rm'
if isatty 0 # stdin
  set -a rm_and_tty_arg '-it'
end

mkdir -p node_modules/.docker
docker run $rm_and_tty_arg \
  -v "$PWD:/hex-engine" \
  -v "$PWD/node_modules/.docker:/hex-engine/node_modules" \
    suchipi/node-nw-env:0.7.0 \
      bash -c \
        "Xvfb -screen 0 1024x768x16 -ac & source /usr/local/nvm/nvm.sh && cd /hex-engine && nvm install && nvm use && $argv"
