FROM node:14

WORKDIR /usr/src/app
COPY package*.json ./
COPY . .

RUN useradd -m dfu && \
    chown -R dfu:dfu /usr/src/app
	
USER dfu


RUN npm install

RUN npm run build

EXPOSE 8080

CMD ["npm", "start"]