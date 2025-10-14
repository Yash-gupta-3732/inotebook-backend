const dotenv = require('dotenv')
dotenv.config(); // <-- load .env first
const connTOMongo = require("./db");
const express = require('express');
const cors = require('cors');
let isConnected = false;

const app = express();
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  if (!isConnected) {
    connTOMongo().then(() => {
      next();
    });
  } else {
    next();
  }
});
// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/notes', require('./routes/notes'));

// Start server
// app.listen(port, () => {
//   console.log(`inotebook website listening on port http://localhost:${port}`)
// })  replace the last line (where you use app.listen(...)) with:module.exports = app; for the deployment

module.exports = app; // Vercel manages the server itself — it doesn’t want you to manually start a port.