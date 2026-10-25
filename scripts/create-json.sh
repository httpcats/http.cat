#!/bin/bash

# Script retrieves all http status codes from official Wikipedia page
# and creates .json files for these, but only if they also exist within public/images

HTTP_STATUS_CODES_URL=https://en.wikipedia.org/wiki/List_of_HTTP_status_codes
HTML_REGEX='(?<=><\/span>).*?(?=<\/dt>)'

# Retrieve HTML from URL
HTTP_STATUS_CODES_HTML=$(curl -L $HTTP_STATUS_CODES_URL)

# Run Regex to get closest to http status code information
STATUS_CODE_HTML_LIST=$(echo "$HTTP_STATUS_CODES_HTML" | grep -o -P "$HTML_REGEX")

# JSON template for .json files
JSON_TEMPLATE='{"code":"%s","text":"%s"}'
mkdir -p public/json

# Loop through every http status html and retrieve code and text.
# Create a .json file only if the http code already exist as a .jpg image.
while IFS= read -r line; do
  http_status_string=$(echo "$line" | sed 's/([^()]*)//g' | sed 's/.*<\/span>//' | sed 's/<\/a>//' | sed 's/.*>//')
  http_code=$(cut -d' ' -f1 <<< "$http_status_string")
  http_text=$(cut -d' ' -f 2- <<< "$http_status_string" | xargs)
  json_string=$(printf "$JSON_TEMPLATE" "$http_code" "$http_text")
  if [[ -f "public/images/$http_code.jpg" ]]; then
    echo "$json_string" > "public/json/$http_code.json"
  fi
done <<< "$STATUS_CODE_HTML_LIST"
