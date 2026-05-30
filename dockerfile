#HOW TO MAKE IMAGE

# FROM node:20-aphine
# COPY ./Backend .
# RUN npm install
# CMD ["node" , "server.js"]   -> runs at image running ( line 9 )

# docker build . -t <name>
# docker run p <machine-port>:<CODE:PORT> <name>

FROM node:20-aphine as frontend-builder

COPY ./Frontend /app

WORKDIR /app

RUN npm install

RUN npm run build 

FROM node:20-aphine

COPY ./Backend /app

WORKDIR /app

RUN npm install

COPY --from=frontend-builder /app/dist /app/public

CMD ["node" , "server.js"]