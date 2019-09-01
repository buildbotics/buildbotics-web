#!/bin/bash

if [ $# -ne 1 -a $# -ne 2 ]; then
  echo "Usage: $0 <path> [data]"
  exit 1
fi

get_cred() {
  grep "^$1:" $CREDS | cut -d: -f2- | tr -d '[:space:]'
}


CREDS=bigcommerce-credentials.txt
CLIENT="$(get_cred "CLIENT ID")"
TOKEN="$(get_cred "ACCESS TOKEN")"
URL="$(get_cred "API PATH")$1"
CREDS="-H X-Auth-Client:$CLIENT -H X-Auth-Token:$TOKEN"

(
  if [ $# -eq 2 ]; then
    DATA="$2"
    echo "$DATA" | json_pp 2>&1 >/dev/null
    if [ $? -ne 0 ]; then
      DATA:="$(cat $DATA)"
    fi

    curl -s -X POST $CREDS -H "Content-Type: application/json" "$URL" -d "$DATA"

  else
    curl -s $CREDS "$URL"
  fi

) | json_pp
