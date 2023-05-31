FROM node:14-alpine

# Create app directory
WORKDIR /jianxian/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

# The EXPOSE directive declares the port that the container runtime provides services,
# Which is just a declaration
# The application will not open the service of this port because of this declaration when the container is running.
EXPOSE 49160

# For real running binding of port
# -p <host port>:<container application port>

CMD [ "node", "CustomerBackEnd.js" ]