FROM node:alpine

COPY sshd_config /etc/ssh/
COPY entrypoint.sh ./
RUN chmod +x entrypoint.sh

# Start and enable SSH
RUN apk add openssh \
    && echo "root:Docker!" | chpasswd \
    && chmod +x ./entrypoint.sh \
    && cd /etc/ssh/ \
    && ssh-keygen -A

WORKDIR /app
COPY ./ /app
RUN npm install

ENTRYPOINT [ "./entrypoint.sh" ]
