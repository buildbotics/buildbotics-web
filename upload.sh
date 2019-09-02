#!/usr/bin/env bash

cd "$(dirname "$0")"

# Admin API key goes here
KEY=$(cat secret.key)

# Split the key into ID and SECRET
TMPIFS=$IFS
IFS=':' read ID SECRET <<< "$KEY"
IFS=$TMPIFS

# Prepare header and payload
NOW=$(date +'%s')
FIVE_MINS=$(($NOW + 300))
HEADER="{\"alg\":\"HS256\",\"typ\":\"JWT\",\"kid\":\"$ID\"}"
PAYLOAD="{\"iat\":$NOW,\"exp\":$FIVE_MINS,\"aud\":\"/v2/admin/\"}"

# Helper function for perfoming base64 URL encoding
base64_url() {
  # Use `tr` to URL encode the output from base64.
  base64 -w 0 | tr -d '=' | tr '+' '-' |  tr '/' '_'
}

# Prepare the token body
header_base64=$(echo -n "$HEADER" | base64_url)
payload_base64=$(echo -n "$PAYLOAD" | base64_url)

header_payload="${header_base64}.${payload_base64}"

# Create the signature
signature=$(echo -n "${header_payload}" |
              openssl dgst -binary -sha256 -mac HMAC -macopt hexkey:$SECRET |
              base64_url)

# Concat payload and signature into a valid JWT token
TOKEN="${header_payload}.${signature}"

RESULT=$(curl -f -X POST -H "Authorization: Ghost $TOKEN" \
              "https://buildbotics.com/ghost/api/v2/admin/themes/upload/" \
              -F "file=@build/buildbotics.zip")

if [ $? -eq 0 ]; then
    exit 0

else
    echo Failed
    echo $RESULT
    exit 1
fi
