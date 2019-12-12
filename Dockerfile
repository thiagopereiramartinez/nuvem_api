# Imagem base
FROM alpine:latest

# Informações da imagem
LABEL maintainer="Thiago P. Martinez <thiago.pereira.ti@gmail.com>"
LABEL version="1.0.0"
LABEL description="API do aplicativo Nuvem To-Do List"

# Instalar nodejs / npm
RUN apk add nodejs npm

# Copiar aplicação
RUN mkdir /app
WORKDIR /app
COPY app/index.js ./
COPY app/package*.json ./

# Instalar dependências da aplicação
RUN npm install

# Expor a porta 8080
EXPOSE 8080

# Executar aplicação
ENTRYPOINT [ "npm", "start" ]
