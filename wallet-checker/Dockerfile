FROM node:12.22.7-alpine 

WORKDIR /

COPY . .

RUN npm install && npm run build

EXPOSE 80
EXPOSE 9229

ENTRYPOINT ["npm", "run", "start"]

 



