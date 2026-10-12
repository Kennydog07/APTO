# Pinned base image (Node 22 LTS, Alpine). Update deliberately, then re-run tests.
FROM node:22.22.0-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY src ./src
COPY config ./config
COPY scripts ./scripts
RUN mkdir -p /data && chown -R node:node /data
USER node
ENV DB_PATH=/data/ops.sqlite PORT=8080
EXPOSE 8080
HEALTHCHECK --interval=60s --timeout=5s --retries=3 CMD wget -qO- http://127.0.0.1:8080/healthz || exit 1
CMD ["node", "--disable-warning=ExperimentalWarning", "src/server.js"]
