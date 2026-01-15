#!/bin/sh
pnpm exec prisma generate
pnpm run migrate:dev
pnpm run build
exec "$@"