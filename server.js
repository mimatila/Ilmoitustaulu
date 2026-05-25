const express = require("express");
const fs = require("fs");
const cors = require("cors");
const ADMIN_PASSWORD = "1234";

const app = express();

// 🔥 CORS ENSIN
app.use(cors());

// sitten JSON parsing
app.use(express.json());

const FILE = "boards.json";

if (!fs.existsSync(FILE)) {
  fs.writeFileSync(FILE, "{}");
}

app.post("/login", (req, res) => {

  const { name, password } = req.body;

  const data = JSON.parse(fs.readFileSync(FILE, "utf8"));

  if (!data[name]) {
    return res.status(404).json({
      success: false,
      message: "Taulua ei löydy"
    });
  }

  if (data[name].password !== password) {
    return res.status(401).json({
      success: false,
      message: "Väärä salasana"
    });
  }

  // 👍 onnistui
  res.status(200).json({
    success: true
  });

});

app.post("/create", (req, res) => {

  const { name, password, adminPassword } = req.body;

  // 🔥 tarkista admin salasana
  if (adminPassword !== ADMIN_PASSWORD) {
    return res.status(401).json({
      success: false,
      message: "Ei oikeuksia luoda taulua"
    });
  }

  const data = JSON.parse(fs.readFileSync(FILE, "utf8"));

  if (data[name]) {
    return res.status(400).json({
      success: false,
      message: "Taulu on jo olemassa"
    });
  }

  data[name] = {
  password,
  messages: []
  };

  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));

  res.json({
    success: true,
    message: "Taulu luotu"
  });

});

app.delete("/delete/:name", (req, res) => {

  const name = req.params.name;
  const { password } = req.body;

  const data = JSON.parse(
    fs.readFileSync(FILE, "utf8")
  );

  // löytyykö taulu
  if (!data[name]) {
    return res.status(404).json({
    success: false,
    message: "Taulua ei löytynyt"
  });
  }

  // tarkista salasana
  if (data[name].password !== password) {
    return res.status(401).json({
    success: false,
    message: "Väärä salasana"
  });
  }

  delete data[name];

  fs.writeFileSync(
    FILE,
    JSON.stringify(data, null, 2)
  );

  res.json({ success: true, message: "Taulu poistettu" });

});

app.post("/message", (req, res) => {

  const { name, password, message } = req.body;

  const data = JSON.parse(
    fs.readFileSync(FILE, "utf8")
  );

  if (!data[name]) {
    return res.status(404).json({
      success: false,
      message: "Taulua ei löydy"
    });
  }

  if (data[name].password !== password) {
    return res.status(401).json({
      success: false,
      message: "Väärä salasana"
    });
  }

  // 🔥 TÄMÄ PITÄÄ OLLA ENNEN RESPONSEA
  data[name].messages.push(message);

  fs.writeFileSync(
    FILE,
    JSON.stringify(data, null, 2)
  );

  res.json({ success: true, message: "Viesti tallennettu" });

});

app.get("/favicon.ico", (req, res) => {
  res.status(204).end();
});

app.get("/board/:name", (req, res) => {

  const data = JSON.parse(fs.readFileSync(FILE, "utf8"));

  const board = data[req.params.name];

  if (!board) {
    return res.status(404).json({
      success: false,
      message: "Taulua ei löydy"
    });
  }

  res.json(board);
});

app.listen(3000, () => {
  console.log("Serveri käynnissä portissa 3000");
});