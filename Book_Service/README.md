## EC2 Running

This project is for the Book Service

## Tools and Technologies

- Framework: NodeJS
- Language: Javascript
- Backend: Express
- Deployment AWS EC2

## Repository Setup

- Install [NodeJS/NPM](https://nodejs.org/en/download/)
- Install packages
  - Run `npm install` in the repo root directory
- Install [Docker](https://docs.docker.com/get-docker/)
- Install tools
  - Run `npm install -g npm-check-updates` for dependencies checker

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### `npm run lint`

This runs ESLint for the files in the `src/` directory containing the React app and the `server/` directory containing the API server.

### Local development

Start the API server with `npm run start`. This starts the backend server at http://localhost:3000.

- Open [http://localhost:3000](http://localhost:3000) to view it in the browser.
- The page will reload if you make edits. You will also see any lint errors in the console.

### Docker

- Build server for deployment
  - run `npm run preserver`
- Build react app
  - run `npm run build`
- View existing docker images
  - run `docker ps`
- Build docker image:
  - run `docker build -t ljx02263/ediss-a1:latest`
  - or unique name `ljx02263/<unique tag>`
- Run docker image:
  - run `docker run -p 80:3000 ljx02263/ediss-a1:latest`
- Stop docker image:
  - run `docker ps` to find the ID of the container you want to stop
  - run `docker stop <container id>` to stop the container
