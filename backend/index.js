// server.js
require("dotenv").config();
const app = require("./app");
const { initTables } = require("./src/config/initTables");

if (process.env.RUN_DB_INIT === "true") {
  initTables();
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
