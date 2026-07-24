FROM node:22-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY server/package.json server/package-lock.json* ./
RUN npm install --omit=dev
COPY server/ ./
COPY server/data/store.json /app/seed/store.json
COPY --from=frontend-build /app/frontend/dist ./public
ENV PORT=8080
ENV DATA_DIR=/app/data
ENV SEED_PATH=/app/seed/store.json
VOLUME ["/app/data"]
EXPOSE 8080
CMD ["node", "index.js"]
