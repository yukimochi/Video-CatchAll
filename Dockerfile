FROM node:alpine

WORKDIR /app
COPY . /app
RUN apk add --no-cache -U mkvtoolnix
RUN yarn

ENTRYPOINT [ "node", "index.js" ]
