# Readme

# House.Coop App

The Housecoop tool is a digital platform that makes it possible to create a democratic co-operative. It is built specifically for housing co-operatives, where people join forces to create self-organised and self-owned housing. Like any cooperative process, this requires the group of people to agree on a number of things.

This tool gives every member of the cooperative a single vote on these decisions. The tool can come with the standard decisions and milestones already in place, but specific decisions can easily be added. The tool becomes the place where everything is captured so that the process can move on without revisiting decisions and there is a clear overview of the progress.

### Repository

This repository is hosted on Bitbucket and Github. 

- Bitbucket is the working repository where the latest commits are pushed
- Github has the latest stable release to be deployed by end-users.

This will be folded into one repository soon.

### Manual

We are currently creating a manual for using the tool. Keep an eye on [housecoop.org](http://housecoop.org) for updates.

## Roadmap

This is the first release of the [House.coop](http://house.coop) App and it is still in beta-stage. We are working on implementing many improvements over the next couple of months to improve the UX and overall quality of the software. 

Next up is implementing tests and improving the UX.

## Architecture

The app in this repository comes with a compiled Vue.js front-end. The repository for the front-end can be found here: [https://bitbucket.org/theincmac/house-coop-frontend/](https://bitbucket.org/theincmac/house-coop-frontend/)

The front-end is served from the `/dist` folder. Overwrite this folder with the `/dist` output from the front-end if you wish to make adjustments to your own front-end.

## Installation

[House.coop](http://house.coop) App is based on a Vue-Node-Mongo stack. 

### Prerequisites

- Node.js version 10 or later
    [Installation instructions from Nodejs.dev](https://nodejs.dev/how-to-install-nodejs)
- MongoDB version 3.4 or later
    [Installation instructions from MongoDB documentation](https://docs.mongodb.com/manual/installation/)
- [Nodemon](https://github.com/remy/nodemon), version 2 or later (for development only)
    Available on npm:`npm install nodemon -g` 

Nodemon is to ease development, but can be stripped from the start script in the `package.json`.

### Installing

Once the prerequisites are installed, the installation process is straightforward: clone this repository and run `npm install`.

```bash
$ git clone git@bitbucket.org:theincmac/house-coop-app.git
$ cd house-coop-app
$ npm install
```

### Configuration

Some [environmental variables](https://medium.com/the-node-js-collection/making-your-node-js-work-everywhere-with-environment-variables-2da8cdf6e786) need to best to run the application. These can be supplied in a `.env` file (in project root) or passed as arguments for scripts in the package.json (see example below).

````javascript
{
  "name": "Your App",
  "scripts": {
    "start": "env NODE_ENV=production node app.js",
    "dev": "node install.js && env NODE_ENV=dev PORT=3000 nodemon ./bin/www"
  },
  ...
  "dependencies": {}
}
````

#### Admin keypair

The application requires a keypair for encryption. When running `npm run dev` a keypair is generated (if not present) and appended to the .env file. When deploying through git (e.g. to heroku), note that .env files are ignored. So, you have to manually include them as a .env arguments. You can generate a keypair on the housecoop website: http://housecoop.org/generate/

```javascript
ADMIN_PRIVATE_KEY=/*u64 encoded string*/
ADMIN_PUBLIC_KEY=/*u64 encoded string*/
```
####MongoDB connection

You should supply a [MONGODB_URI](https://docs.mongodb.com/manual/reference/connection-string/), or the application will revert to `mongodb://127.0.0.1:27017`. 

```javascript
MONGODB_URI=/* mongodb://[username]:[password]@[url]:[port]/[opt] */
```
#### Port

```javascript
PORT=/* default is 3000 */
```

### Run the application

It's re

The application 

...

### Deploy on Heroku

## Front-end

The House.coop app comes wiht a 

## 

## Contributing

For contributing to this project, please refer to the Bitbucket repository.

## Authors

## Licence

## Acknowledgements