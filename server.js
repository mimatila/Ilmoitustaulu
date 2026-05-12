const express = require("express");
const fs = require("fs");
const cors = require("cors");

const app = express();

// 🔥 CORS ENSIN
app.use(cors());

// sitten JSON parsing
app.use(express.json());

const FILE = "boards.json";

if (!fs.existsSync(FILE)) {
  fs.writeFileSync(FILE, "{}");
}

app.post("/create", (req, res) => {
  const { name, password } = req.body;

  const data = JSON.parse(fs.readFileSync(FILE, "utf8"));

  data[name] = {
    password,
    message: ""
  };

  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));

  res.send("Taulu luotu");
});

  app.get("/boards", (req, res) => {
  const data = JSON.parse(fs.readFileSync("boards.json", "utf8"));
  res.json(data);
});

app.delete("/delete/:name", (req, res) => {
  const name = req.params.name;

  const data = JSON.parse(fs.readFileSync(FILE, "utf8"));

  // tarkista löytyykö
  if (!data[name]) {
    return res.status(404).send("Taulua ei löytynyt");
  }

  // poista
  delete data[name];

  // tallenna takaisin
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));

  res.send("Taulu poistettu");
});

app.listen(3000, () => {
  console.log("Serveri käynnissä portissa 3000");
});