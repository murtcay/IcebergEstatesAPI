require('dotenv').config();
require('express-async-errors');

// express
const express = require('express');
const app = express();
const port = process.env.PORT || 5000;

// rest of the packages

// routes
const authRouter = require('./routes/authRouter');

// middleware
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');

app.use(express.json());

app.use('/api/v1/auth', authRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const startServer = async () => {
  try {
    app.listen(port, console.log(`Server is listening on port: ${port}...`));
  } catch (error) {
    console.log(error);
  }
};

startServer();