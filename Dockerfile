
FROM node:10-alpine

WORKDIR hack9

COPY index.js ./
COPY package.json ./
COPY script.yml ./

RUN npm install

ENTRYPOINT ["node", "."]
