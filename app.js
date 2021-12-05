require('dotenv').config();
require('express-async-errors');

const express = require('express');
const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());

// routes
app.get('/api/v1', (req, res) => {
  res.send('Iceberg Estates API');
});

const startServer = async () => {
  try {
    app.listen(port, console.log(`Server is listening on port: ${port}...`));
  } catch (error) {
    console.log(error);
  }
};

startServer();