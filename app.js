require('dotenv').config();
require('express-async-errors');

// express
const express = require('express');
const app = express();
const port = process.env.PORT || 5000;

// rest of the packages

// database
const connectDB = require('./db/connect');

// routes
const authRouter = require('./routes/authRouter');
const userRouter = require('./routes/userRouter');

// middleware
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');

app.use(express.json());

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const startServer = async () => {
  try {
    await connectDB(process.env.MONGO_URL);
    console.log('CONNECTED TO DB!!!');
    app.listen(port, console.log(`Server is listening on port: ${port}...`));
  } catch (error) {
    console.log(error);
  }
};

startServer();