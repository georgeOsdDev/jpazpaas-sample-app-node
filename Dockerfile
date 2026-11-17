FROM node:25.4.0-alpine3.23

COPY sshd_config /etc/ssh/
COPY entrypoint.sh /
RUN chmod +x entrypoint.sh

# Start and enable SSH
RUN apk add --no-cache 'openssh>=10.2_p1-r1' \
    && echo "root:Docker!" | chpasswd \
    && chmod +x ./entrypoint.sh \
    && cd /etc/ssh/ \
    && ssh-keygen -A

WORKDIR /app
COPY ./ /app
RUN npm install

ENTRYPOINT [ "/entrypoint.sh" ]
