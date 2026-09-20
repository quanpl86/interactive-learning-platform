# syntax=docker/dockerfile:1.7
FROM node:24-alpine AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable && corepack prepare pnpm@11.19.0 --activate
WORKDIR /workspace

FROM base AS dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY apps/admin-studio/package.json apps/admin-studio/package.json
COPY apps/learning-workspace/package.json apps/learning-workspace/package.json
COPY packages/design-tokens/package.json packages/design-tokens/package.json
COPY packages/lesson-schema/package.json packages/lesson-schema/package.json
COPY packages/shared-ui/package.json packages/shared-ui/package.json
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

FROM dependencies AS dev
COPY . .
EXPOSE 5173 5174
CMD ["pnpm", "dev"]

FROM dependencies AS build
COPY . .
ARG APP_NAME
RUN test "$APP_NAME" = "admin-studio" -o "$APP_NAME" = "learning-workspace"
RUN pnpm --filter "@ilp/$APP_NAME" build

FROM node:24-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY scripts/serve-static.mjs ./serve-static.mjs
ARG APP_NAME
COPY --from=build /workspace/apps/${APP_NAME}/dist ./public
EXPOSE 8080
USER node
CMD ["node", "serve-static.mjs"]
