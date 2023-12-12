FROM node:20-alpine
WORKDIR /app
COPY . .

RUN npm install 


EXPOSE ${ARG_HTTP_PORT}

CMD npm start

