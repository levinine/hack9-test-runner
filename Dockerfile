
FROM node:10-alpine

WORKDIR hack9

COPY index.js ./
COPY package.json ./
COPY artillery-load-tests ./artillery-load-tests/

RUN npm install
RUN cd artillery-load-tests && npm install

ENTRYPOINT ["node", "."]
