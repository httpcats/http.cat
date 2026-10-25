#!/usr/bin/env bash

# Serves out/ through the production Nginx config (deploy/nginx/http.cat.conf,
# unmodified) in a Docker container, to test the site before deploying:
#
#   npm run nginx:up     https://localhost:8443 (http://localhost:8080 only
#                        redirects to https://http.cat, the production site)
#   npm run test:smoke   checks the URLs in the specs against it
#   npm run nginx:down
#
# The Certbot files the config includes are replaced by a self-signed
# certificate in .local-nginx/. Run `npm run nginx:up` again after each build:
# `next build` recreates out/, and the container keeps the old one mounted.
# NGINX_IMAGE overrides the image, e.g. to match the server's `nginx -v`.

set -o nounset
set -o errexit
set -o pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CONF="$ROOT/deploy/nginx/http.cat.conf"
CERTS="$ROOT/.local-nginx/letsencrypt"
NAME=http.cat-nginx
# the server's version (Ubuntu 26.04's nginx, checked on 2026-10-25)
IMAGE="${NGINX_IMAGE:-nginx:1.28.3-alpine}"

# Docker access without sudo is root-equivalent (e.g. the docker group on
# Linux), so not every user has it. Only the docker calls elevate, and only
# when the daemon can't be reached without sudo.
DOCKER_SUDO=0
if ! command docker info >/dev/null 2>&1; then
  DOCKER_SUDO=1
fi

docker() {
  if [[ $DOCKER_SUDO == 1 ]]; then
    sudo docker "$@"
  else
    command docker "$@"
  fi
}

make_certs() {
  [[ -f "$CERTS/live/http.cat/fullchain.pem" ]] && return
  echo "Creating a self-signed certificate in .local-nginx/"
  mkdir -p "$CERTS/live/http.cat"
  openssl req -x509 -newkey rsa:2048 -nodes -days 3650 -subj /CN=http.cat \
    -addext subjectAltName=DNS:http.cat,DNS:localhost,IP:127.0.0.1 \
    -keyout "$CERTS/live/http.cat/privkey.pem" \
    -out "$CERTS/live/http.cat/fullchain.pem" 2>/dev/null
  openssl dhparam -dsaparam -out "$CERTS/ssl-dhparams.pem" 2048 2>/dev/null
  # stands in for Certbot's TLS settings, which the test doesn't depend on
  : > "$CERTS/options-ssl-nginx.conf"
}

up() {
  if [[ ! -d "$ROOT/out" ]]; then
    echo "out/ not found, run \`npm run build\` first" >&2
    exit 1
  fi
  make_certs

  # mount out/ wherever the config expects the site to be
  local webroot
  webroot="$(sed -n 's/^ *root \(.*\);$/\1/p' "$CONF")"

  # IPv6 is off in Docker containers by default, and the config listens on [::]
  local args=(
    --sysctl net.ipv6.conf.all.disable_ipv6=0
    -p 127.0.0.1:8080:80
    -p 127.0.0.1:8443:443
    -v "$CONF:/etc/nginx/conf.d/default.conf:ro"
    -v "$CERTS:/etc/letsencrypt:ro"
    -v "$ROOT/out:$webroot:ro"
  )

  docker rm -f "$NAME" >/dev/null 2>&1 || true

  # in the foreground first, so a config error is printed instead of lost with
  # the container
  echo "Checking the config with $IMAGE"
  docker run --rm "${args[@]}" "$IMAGE" nginx -t

  docker run -d --name "$NAME" "${args[@]}" "$IMAGE" >/dev/null
  for _ in $(seq 20); do
    if curl -sk -o /dev/null https://127.0.0.1:8443/; then
      echo "Serving out/ at https://localhost:8443"
      echo "(http://localhost:8080 redirects to https://http.cat, as in production)"
      return
    fi
    sleep 0.5
  done
  echo "Nginx didn't start:" >&2
  docker logs "$NAME" >&2
  exit 1
}

down() {
  if docker rm -f "$NAME" >/dev/null 2>&1; then
    echo "Stopped $NAME"
  else
    echo "$NAME isn't running"
  fi
}

case "${1:-}" in
  up) up ;;
  down) down ;;
  *)
    echo "Usage: $0 up|down" >&2
    exit 2
    ;;
esac
