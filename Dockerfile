FROM node:16.14.2

MAINTAINER FreshWorks <web@freshworks.io>

ENV PATH $PATH:/usr/src/app/node_modules/.bin

WORKDIR /usr/src/app

COPY ./package/package*.json ./package/
COPY ./package/webpack.config.js ./package/
COPY ./package/.babelrc ./package/
COPY ./package/keys.json ./package/


# RUN mkdir -p node_modules/.cache && chmod -R 777 node_modules/.cache
# Install dependencies
# RUN apk add --no-cache git

# RUN apt-get update
# RUN apt-get install libgl1 -y


RUN cd ./package && npm i && cd ..
# RUN chown -R node ./app/node_modules
# RUN chmod 777 ./front_end/app/node_modules

# USER node

EXPOSE 3000

CMD [ "npm", "--prefix", "./package", "run", "start" ]