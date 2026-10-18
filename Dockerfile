FROM node:20-bookworm-slim

RUN apt-get update && \
  apt-get install -y --no-install-recommends \
  ffmpeg \
  imagemagick \
  webp \
  git \
  ca-certificates && \
  rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json ./

RUN npm install --omit=dev

COPY . .

EXPOSE 3000

CMD ["node", "index.js"]
