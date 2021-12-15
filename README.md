# Iceberg Estates API

This API project aims to solve the following problem.

**Problem:**

A real estate agent has trouble keeping track of which house his employees will show, when, and to which client.

The company manager, who wants to use his employees more effectively, especially wants to be able to control the length of the processes to and from the appointments, the time the employees allocate for appointments and all these appointments without conflicts.

## Requirements

For development, you will need Node.js and Google Map Distance Matrix API Key for distance, and time calculations.

### Node
- #### Node installation on Windows

    Just go on [official Node.js website](https://nodejs.org/) and download the installer.
Also, be sure to have `git` available in your PATH, `npm` might need it (You can find git [here](https://git-scm.com/)).

- #### Node installation on Ubuntu

    You can install nodejs and npm easily with apt install, just run the following commands.
    ``` bash
    $ sudo apt install nodejs
    $ sudo apt install npm
    ```

- #### Other Operating Systems
You can find more information about the installation on the [official Node.js website](https://nodejs.org/) and the [official NPM website](https://npmjs.org/).
If the installation was successful, you should be able to run the following command.

``` bash
$ node --version
v14.18.0

$ npm --version
6.14.15

```


## Dependencies

- axios
- bcryptjs
- cookie-parser
- dotenv
- express,
- express-async-errors
- http-status-codes
- jsonwebtoken
- mongoose
- validator

**Development dependencies**
- nodemon


## Install dependencies
``` bash
$ git clone https://github.com/murtcay/IcebergEstatesAPI.git
$ cd IcebergEstatesAPI
$ npm install
```

## Configure app
In order to avoid port collisions, in the source code port value is 5000.

In order to spin up the project, in the root create .env with these variables, with your own values.

- MONGO_URL
- JWT_SECRET
- JWT_LIFETIME
- GOOGLE_MAPS_DISTANCE_MATRIX_API_KEY

## Running the project in production mode
``` bash
$ npm start
```

## Running the project in development mode
``` bash
$ npm run dev
```
