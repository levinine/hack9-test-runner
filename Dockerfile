
FROM node:10-alpine

WORKDIR hack9

COPY index.js ./
COPY package.json ./
COPY artillery-load-tests ./artillery-load-tests/
COPY functional-tests ./functional-tests/
COPY k6-load-tests ./k6-load-tests/

COPY --from=loadimpact/k6 /usr/bin/k6 /usr/bin/k6

RUN npm install
RUN npm install -g newman
# RUN cd artillery-load-tests && npm install

ENTRYPOINT ["node", "."]
