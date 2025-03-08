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



