// LOGIN
if (document.getElementById("ilmoitustaulu")) {
  document.getElementById("ilmoitustaulu").addEventListener("click", loginBoard);
}

if (document.getElementById("koti")) {
  document.getElementById("koti").addEventListener("click", koti);
}

if (document.getElementById("name")) {

 window.addEventListener("DOMContentLoaded", () => {

  const name = localStorage.getItem("boardName") || "";
  const password = localStorage.getItem("boardPassword") || "";
  const username = localStorage.getItem("username") || "";

  const loggedIn = localStorage.getItem("loggedIn");
  const skip = sessionStorage.getItem("skipAutoLogin");

  // 🔥 AUTLOGIN
  if (!skip && loggedIn === "true") {
    window.location.href = "board.html";
    return;
  }

  sessionStorage.removeItem("skipAutoLogin");

  // 🔥 TÄYTTÖ AINA (tämä on tärkein osa)
  const nameInput = document.getElementById("name");
  const passwordInput = document.getElementById("password");
  const usernameInput = document.getElementById("username");

  if (nameInput) nameInput.value = name;
  if (passwordInput) passwordInput.value = password;
  if (usernameInput) usernameInput.value = username;

});
}

function loginBoard() {

  const name = document.getElementById("name").value;
  const password = document.getElementById("password").value;
  const username = document.getElementById("username").value;

  fetch("http://localhost:3000/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, password, user: username })
  })
  .then(res => res.json())
  .then(data => {
    if (!data.success) return alert(data.message);

    localStorage.setItem("boardName", name);
    localStorage.setItem("boardPassword", password);
    localStorage.setItem("username", username);

    localStorage.setItem("loggedIn", "true");

    window.location.href = "board.html";
  });
}

function koti() {
  sessionStorage.setItem("skipAutoLogin", "1");
  window.location.href = "index.html";
}

function logout() {
  localStorage.removeItem("boardName");
  localStorage.removeItem("boardPassword");
  localStorage.removeItem("username");
  localStorage.removeItem("loggedIn");

  window.location.href = "index.html";
}

function createBoard() {
  const name = document.getElementById("name").value;
  const password = document.getElementById("password").value;
  const username = document.getElementById("username").value;

  const adminPassword = prompt("Anna admin-salasana:");

  fetch("http://localhost:3000/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, password, username, adminPassword })
  })
  .then(res => res.json())
  .then(data => {

  localStorage.setItem("boardName", name);
  localStorage.setItem("boardPassword", password);
  localStorage.setItem("username", username);

  document.getElementById("name").value = "";
  document.getElementById("password").value = "";
  document.getElementById("username").value = "";

  alert(data.message);

});
}

function deleteBoard() {

  if (!confirm("Haluatko varmasti poistaa taulun?")) return;
  
  const name = document.getElementById("name").value;
  const password = document.getElementById("password").value;

  fetch(`http://localhost:3000/delete/${name}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password })
  })
  .then(async res => {
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return alert(data.message || "Virhe");
    }

    // 🔥 tyhjennä inputit
    document.getElementById("name").value = "";
    document.getElementById("password").value = "";
    document.getElementById("username").value = "";

    // 🔥 tyhjennä localStorage (TÄRKEÄ)
    localStorage.removeItem("boardName");
    localStorage.removeItem("boardPassword");
    localStorage.removeItem("username");

    alert(data.message);

    // (valinnainen mutta hyvä)
    // window.location.href = "index.html";
  });
}

// BOARD
if (document.getElementById("boardName")) {

  const boardName = localStorage.getItem("boardName");

  document.getElementById("boardName").innerText = boardName;

function loadMessage(forceScroll = false) {

  const box = document.getElementById("message");

  fetch(`http://localhost:3000/board/${boardName}`)
    .then(res => res.json())
    .then(data => {

      const isAtBottom =
        box.scrollTop + box.clientHeight >= box.scrollHeight - 10;

      box.innerHTML = "";

      (data.messages || []).forEach(msg => {
        const div = document.createElement("div");
        div.innerText = `${msg.time} - ${msg.author}: ${msg.text}`;
        box.appendChild(div);
      });

      // 🔥 nyt oikein
      if (forceScroll || isAtBottom) {
        box.scrollTop = box.scrollHeight;
      }

    });
}

  window.updateMessage = function () {

  console.log("UPDATE MESSAGE KUTSUTAAN");
  const message = document.getElementById("newMsg").value;

  const name = localStorage.getItem("boardName");
  const password = localStorage.getItem("boardPassword");
  const user = localStorage.getItem("username") || name;

  console.log("LOGIN KUTSUTAAN");

  fetch("http://localhost:3000/message", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      password,
      message,
      user
    })
  })
  .then(res => res.json())
  .then(data => {
  if (!data.success) return alert(data.message);

  loadMessage(true);

  document.getElementById("newMsg").value = "";
  
});
  
}
  loadMessage();
  
}

document.getElementById("newMsg").addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    e.preventDefault(); // estää rivinvaihdon
    updateMessage();
  }
});