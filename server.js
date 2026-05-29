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

app.post("/login", (req, res) => {

  //console.log("REQ BODY:", req.body);

  const { name, boardPassword, user } = req.body;

  const data = JSON.parse(fs.readFileSync(FILE, "utf8"));

  if (!data[name]) {
    return res.status(404).json({
      success: false,
      message: "Taulua ei löydy"
    });
  }

  if (data[name].boardPassword !== boardPassword) {
    return res.status(401).json({
      success: false,
      message: "Väärä salasana"
    });
  }

  if (!data[name].members.includes(user)&&user!=null&&user!="") {
  data[name].members.push(user);

  console.log("MEMBERS HERE:", data[name].members);

  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

  // 👍 onnistui
  res.status(200).json({
    success: true
  });

});

app.post("/create", (req, res) => {

  const { name, boardPassword, username, ownerPassword } = req.body;
  console.log(req.body);

  const data = JSON.parse(fs.readFileSync(FILE, "utf8"));

  if (data[name]) {
    return res.status(400).json({
      success: false,
      message: "Taulu on jo olemassa"
    });
  }

  /*
  data[name] = {
  password,
  messages: []
  };*/

 data[name] = {
  boardPassword,
  owner: username,
  ownerPassword,
  members: [username],
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
  const { ownerPassword } = req.body;

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
  if (data[name].ownerPassword !== ownerPassword) {
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

  const { name, boardPassword, message, user } = req.body;

  const data = JSON.parse(
    fs.readFileSync(FILE, "utf8")
  );

  if (!data[name]) {
    return res.status(404).json({
      success: false,
      message: "Taulua ei löydy"
    });
  }

  if (data[name].boardPassword !== boardPassword) {
    return res.status(401).json({
      success: false,
      message: "Väärä salasana"
    });
  }

  // 🔥 TÄMÄ PITÄÄ OLLA ENNEN RESPONSEA
  //data[name].messages.push(message);

  data[name].messages.push({
  author: user,
  time: new Date().toISOString(),
  text: message
  });

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

app.get("/boards", (req, res) => {
  const data = JSON.parse(fs.readFileSync(FILE, "utf8"));
  res.json(data);
});

app.delete("/clear/:name", (req, res) => {

  const data = JSON.parse(fs.readFileSync(FILE, "utf8"));
  const board = data[req.params.name];

  const { ownerPassword, username } = req.body;

  if (!board) {
    return res.status(404).json({
      success: false,
      message: "Taulua ei löytynyt"
    });
  }

  // 🔥 TÄRKEIN TARKISTUS
  if (
    board.owner !== username ||
    board.ownerPassword !== ownerPassword
  ) {
    return res.status(403).json({
      success: false,
      message: "Ei oikeuksia (ei owner)"
    });
  }

  board.messages = [];

  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));

  res.json({
    success: true,
    message: "Viestit tyhjennetty"
  });
});

app.listen(3000, () => {
  console.log("Serveri käynnissä portissa 3000");
});