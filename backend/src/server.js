// backend/src/server.js
require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`CodeArena Express backend server running on port ${PORT}`);
});
