FROM node:18-alpine3.16
RUN adduser -Ds /bin/bash user
USER user
WORKDIR /home/user/
RUN mkdir server
WORKDIR /home/user/server
RUN chown user:user /home/user -R

COPY package.json .
COPY yarn.lock .

RUN yarn install 
COPY src/index.js .
EXPOSE 3000
ENTRYPOINT [ "node", "index.js" ]