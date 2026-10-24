#!/bin/zsh

# to run this script you must provide an .env file containing the following
# variables:
#
# DEPLOY_USER=<the username on the remote server> ex. johndoe
# DEPLOY_HOST=<the host of the remote server> ex. example.com
# DEPLOY_DIR=<the deployment directory on the remote machine> ex. /var/www/
# CLOUDFLARE_ZONE_ID=<the zone to purge>
# CLOUDFLARE_API_TOKEN=<a token with only the Cache Purge permission on that zone>

set -o nounset
set -o errexit

SOURCE_DIR=out/

# Set the environment by loading from the file "environment" in the same dir
DIR="$( cd "$( dirname $( dirname "$0" ) )" && pwd)"
source "$DIR/.env"

# nounset doesn't catch empty values, and rsync --delete makes them dangerous:
# an empty DEPLOY_DIR syncs into the remote home directory, deleting whatever
# isn't in out/
for var in DEPLOY_USER DEPLOY_HOST DEPLOY_DIR CLOUDFLARE_ZONE_ID CLOUDFLARE_API_TOKEN; do
  if [[ -z ${(P)var} ]]; then
    echo "❌ $var is empty in .env"
    exit 1
  fi
done
if [[ $DEPLOY_DIR != /?* ]]; then
  echo "❌ DEPLOY_DIR must be an absolute path other than /, got: $DEPLOY_DIR"
  exit 1
fi

# an empty or partial out/ would replace the live site
if [[ ! -f "$DIR/${SOURCE_DIR}index.html" ]]; then
  echo "❌ ${SOURCE_DIR}index.html not found, run \`npm run build\` first"
  exit 1
fi

echo "📝 Source: ${DIR}/${SOURCE_DIR}"
echo "🎯 Target: ${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_DIR}"

if rsync -rvzp --delete "$DIR/$SOURCE_DIR" "${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_DIR}"; then
  echo "✅ Deploy successful!"
else
  echo "❌ Deployment error. Check the output!"
  exit 1
fi

echo "🚀 Purging Cloudflare cache"
# the token goes in through stdin, so it isn't visible in the process list
if print -r -- "header = \"Authorization: Bearer ${CLOUDFLARE_API_TOKEN}\"" |
  curl --silent --show-error --fail-with-body --config - \
    -X POST "https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/purge_cache" \
    -H "Content-Type: application/json" --data '{"purge_everything":true}'; then
  echo
  echo "✅ Cloudflare cache purged!"
else
  echo
  echo "❌ Cloudflare purge failed: the site is deployed, but Cloudflare keeps serving cached responses until it's purged"
  exit 1
fi
