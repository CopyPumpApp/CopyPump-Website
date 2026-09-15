FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run check:clean && npm run build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production PORT=8557 HOST=0.0.0.0
COPY --from=build /app/dist ./dist
COPY --from=build /app/server ./server
COPY --from=build /app/config ./config
COPY --from=build /app/package.json ./package.json
USER node
EXPOSE 8557
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 CMD wget -qO- http://127.0.0.1:${PORT:-8557}/api/health/ready >/dev/null || exit 1
CMD ["node","server/index.mjs","--serve-dist"]
