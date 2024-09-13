FROM ubuntu:focal

RUN apt-get update && \
    apt-get install -y curl && \
    curl -sL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get upgrade -y && \
    apt-get install -y nodejs git && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /home/app

COPY main.sh main.sh
COPY script.js script.js
COPY package*.json .

RUN npm install && \
    chmod +x main.sh && \
    chmod +x script.js

ENTRYPOINT [ "/home/app/main.sh" ]

