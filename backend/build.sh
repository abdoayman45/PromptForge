#!/usr/bin/env bash
# Render.com build script
set -o errexit

pip install --upgrade pip
pip install -r requirements.txt
pip install emergentintegrations --extra-index-url https://d33sy5i8bnduwe.cloudfront.net/simple/
