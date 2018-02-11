FROM openjdk:8-jdk
USER root
RUN apt-get update && apt-get install -y curl wget lsof

# install chrome browser
RUN \
  wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - && \
  echo "deb http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google.list && \
  apt-get update && \
  apt-get install -y dbus-x11 google-chrome-stable && \
  rm -rf /var/lib/apt/lists/*

# install nodejs/npm
ENV NODE_VERSION 8.9.4
RUN cd /home \
    && curl -SLO "https://nodejs.org/dist/v$NODE_VERSION/node-v$NODE_VERSION-linux-x64.tar.xz" \
    && xz -d "node-v$NODE_VERSION-linux-x64.tar.xz" \
    && tar xvf "node-v$NODE_VERSION-linux-x64.tar" \
    && ln -s /home/node-v$NODE_VERSION-linux-x64/bin/node /usr/local/bin/node \
    && ln -s /home/node-v$NODE_VERSION-linux-x64/bin/npm /usr/local/bin/npm \
    && rm -rf "node-v$NODE_VERSION-linux-x64.tar"



