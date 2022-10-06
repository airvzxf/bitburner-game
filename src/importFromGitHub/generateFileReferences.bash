#!/usr/bin/env bash

# This script generates a file which contains the list of folders and files,
# which will be export to the game.

# Data that can modified by the user.
JAVASCRIPT_FILE=${PWD}/js-allFiles.js

# Remove previous file if exists.
rm -f "${JAVASCRIPT_FILE}"

# Create a new one and add the first line of code.
touch "${JAVASCRIPT_FILE}"
echo "export const allFiles = [" >"${JAVASCRIPT_FILE}"

# Move to the expected directory.
cd ../airvzxf || {
  echo "ERROR: The directory 'src/airvzxf' not exists."
  exit 1
}

# Add every file/directory into the JavaScript file.
while IFS= read -r -d '' file; do
  echo "	'/airvzxf/${file}'," >>"${JAVASCRIPT_FILE}"
done < <(find -- * -type f -print0)

# Finalize the code.
echo "];" >>"${JAVASCRIPT_FILE}"
