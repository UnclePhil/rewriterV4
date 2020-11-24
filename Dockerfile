ARG SRC_IMG="node:slim"
FROM ${SRC_IMG}

# Bundle APP files
COPY ./src /src

WORKDIR /src
# Install app dependencies
ENV NPM_CONFIG_LOGLEVEL warn
RUN npm install --production

# Show current folder structure in logs
RUN ls -al -R

CMD [ "node", "/src/app.js" ]