require('dotenv').config();
require('express-async-errors');

const express = require('express');
const app = express();
const port = process.env.PORT || 5000;

//error handler
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');

app.use(express.json());

// routes
app.get('/api/v1', (req, res) => {
  res.send('Iceberg Estates API');
});

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