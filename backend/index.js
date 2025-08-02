require('dotenv').config();
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;
const presentationRoutes = require("./routes/presentation");

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Routes
app.use("/api/presentation", presentationRoutes);

app.get("/", (req, res) => {
  res.send("Gerador Inteligente de Apresentações - Backend");
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Backend listening at http://0.0.0.0:${port}`);
});


