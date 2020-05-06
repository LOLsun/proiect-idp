FROM node:latest

RUN npm install npm@latest -g

COPY ./ /opt/frontend
WORKDIR /opt/frontend

RUN npm install

EXPOSE 3000

CMD ["npm", "start"]
