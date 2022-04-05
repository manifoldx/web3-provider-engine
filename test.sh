#!/bin/bash
echo "TEST"
export NODE_ENV=development

node test/index.js | ./node_modules/.bin/tap-spec
