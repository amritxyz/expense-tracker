/* server.js */

const app = require("./index.js");

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`[INFO] Server running on http://localhost:${PORT}`)
})
