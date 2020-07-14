# Node Image -- Alternatively can use https://github.com/keymetrics/docker-pm2/blob/master/tags/latest/jessie/Dockerfile
FROM node:current
# Labels & metadata
LABEL version="latest"
LABEL name="spore"
LABEL description="The image for the spore job"
LABEL maintainer="Prashanth R. <https://github.com/prashanthr>"
# OS Upgrades & Dependencies
RUN apt-get update && apt-get dist-upgrade -y
RUN apt-get install apt-utils -y && apt-get install net-tools vim curl -y 
RUN apt-get clean
# Install Yarn
RUN npm install -g yarn
# Set env
ENV WORK_DIR=/var/www/deploy/app/
ENV NODE_ENV=production
# Workdir
RUN mkdir -p ${WORK_DIR}
WORKDIR ${WORK_DIR}
# package handling
ADD package*.json ${WORK_DIR}
ADD yarn.lock ${WORK_DIR}
RUN yarn --${NODE_ENV}
# Install App Dependencies
COPY . ${WORK_DIR}
# Run application
RUN ls -altr
