#!/bin/bash

cd "$(dirname "$0")"
echo "Running clean script in $PWD"

echo "rm -rf node_modules"
rm -rf node_modules
echo "rm -rf yarn.lock"
rm -rf yarn.lock
rm -rf package-lock.json

echo "rm -rf android/.cxx"
rm -rf android/.cxx
echo "rm -rf android/.gradle"
rm -rf android/.gradle
echo "rm -rf android/build"
rm -rf android/build

cd android
echo "./gradlew clean"
./gradlew clean

cd ..

excho "Cleaning NPM in $PWD"
npm cache clean --force
echo "NPM in $PWD"
npm install