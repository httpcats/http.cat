#!/bin/bash

set -e

# delete all files/folders that have 3 numbers or 3 numbers and something else
# this is because react-snap crawls the image links and assumes those are pages
# to be created.
# hopefully we can completely remove this step when this PR gets merged:
# https://github.com/stereobooster/react-snap/pull/361
rm -fr build/[0-9][0-9][0-9]*
