#!/bin/zsh

# to run this script you must provide an .env file containing the following
# variables:
#
# DEPLOY_USER=<the username on the remote server> ex. johndoe
# DEPLOY_HOST=<the host of the remote server> ex. example.com
# DEPLOY_DIR=<the deployment directory on the remote machine> ex. /var/www/

set -o nounset
set -o errexit

SOURCE_DIR=out/

# Set the environment by loading from the file "environment" in the same dir
DIR="$( cd "$( dirname $( dirname "$0" ) )" && pwd)"
source "$DIR/.env"

echo "📝 Source: ${DIR}/${SOURCE_DIR}"
echo "🎯 Target: ${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_DIR}"

rsync -rvzp --delete ${SOURCE_DIR} ${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_DIR}

if [ $? -eq 0 ]; then
  echo "✅ Deploy successful!"
else
  echo "❌ Deployment error. Check the output!"
fi

echo "🚀 Purging Cloudflare cache"
curl -X POST https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/purge_cache -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" -H "Content-Type: application/json" --data '{"purge_everything":true}'

echo "✅ Cloudflare cache purged!"
