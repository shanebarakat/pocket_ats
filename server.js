require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());


const atsRoutes = require("./routes/ats");
app.use("/api/ats", atsRoutes); 

app.get("/", (req,res) => {
  res.send("SERVEERRR");
});



app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });

  const { Pool } = require("pg");
  require("dotenv").config();
  
  const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    ssl: { rejectUnauthorized: false }, // Required for Supabase connection
  });

  pool.connect()
  .then(() => console.log("✅ Connected to Supabase PostgreSQL"))
  .catch(err => console.error("❌ Connection Error:", err));

module.exports = pool;


