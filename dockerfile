FROM node:25-alpine3.22 AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY stl /usr/share/nginx/html/stl

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
