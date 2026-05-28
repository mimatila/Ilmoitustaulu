document.addEventListener("DOMContentLoaded", () => {

  // =====================
  // INDEX PAGE
  // =====================

  const loginBtn = document.getElementById("ilmoitustaulu");
  if (loginBtn) {
    loginBtn.addEventListener("click", loginBoard);

    document.addEventListener("keydown", (e) => {
      if (e.key === "Enter") loginBtn.click();
    });
  }

  const homeBtn = document.getElementById("koti");
  if (homeBtn) {
    homeBtn.addEventListener("click", koti);
  }

  const todayMode = document.getElementById("todayMode");
  if (todayMode) {
    todayMode.addEventListener("change", () => loadMessage());
  }

  const msgInput = document.getElementById("newMsg");
  if (msgInput) {
    msgInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        updateMessage();
      }
    });
  }

  // =====================
  // AUTO LOGIN + FILL
  // =====================

  const name = localStorage.getItem("boardName") || "";
  const password = localStorage.getItem("boardPassword") || "";
  const username = localStorage.getItem("username") || "";

  const loggedIn = localStorage.getItem("loggedIn");
  const skip = sessionStorage.getItem("skipAutoLogin");

  if (document.getElementById("name")) {

    if (!skip && loggedIn === "true") {
      window.location.href = "board.html";
      return;
    }

    sessionStorage.removeItem("skipAutoLogin");

    document.getElementById("name").value = name;
    document.getElementById("password").value = password;
    document.getElementById("username").value = username;
  }

  // =====================
  // BOARD INIT
  // =====================

  const boardNameEl = document.getElementById("boardName");

  if (boardNameEl) {

    const boardName = localStorage.getItem("boardName");

    boardNameEl.innerText = boardName;

    loadMessage();
  }

});


// =====================
// LOGIN
// =====================

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


// =====================
// NAV
// =====================

function koti() {
  sessionStorage.setItem("skipAutoLogin", "1");
  window.location.href = "index.html";
}

function logout() {
  localStorage.clear();
  window.location.href = "index.html";
}


// =====================
// CREATE BOARD
// =====================

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


// =====================
// DELETE BOARD
// =====================

function deleteBoard() {

  if (!confirm("Haluatko varmasti poistaa taulun?")) return;

  const name = document.getElementById("name").value;
  const password = document.getElementById("password").value;

  fetch(`http://localhost:3000/delete/${name}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password })
  })
  .then(res => res.json())
  .then(data => {

    alert(data.message);

    if (data.success) {
      document.getElementById("name").value = "";
      document.getElementById("password").value = "";
      document.getElementById("username").value = "";

      localStorage.clear();
    }
  });
}


// =====================
// BOARD LOGIC
// =====================

let boardName = null;

const boardNameEl = document.getElementById("boardName");
if (boardNameEl) {
  boardName = localStorage.getItem("boardName");
  boardNameEl.innerText = boardName;
  loadMessage();
}

function loadMessage(forceScroll = false) {

  const box = document.getElementById("message");
  if (!box) return;

  fetch(`http://localhost:3000/board/${boardName}`)
    .then(res => res.json())
    .then(data => {

      const isAtBottom =
        box.scrollTop + box.clientHeight >= box.scrollHeight - 10;

      const todayMode =
        document.getElementById("todayMode")?.checked;

      const today = new Date().toLocaleDateString();

      box.innerHTML = "";

      (data.messages || []).forEach(msg => {

        const div = document.createElement("div");

        const date = new Date(msg.time);
        const msgDate = date.toLocaleDateString();

        if (todayMode && msgDate === today) {
          div.innerText = `Tänään - ${msg.author}: ${msg.text}`;
        } else {
          div.innerText = `${date.toLocaleString()} - ${msg.author}: ${msg.text}`;
        }

        box.appendChild(div);
      });

      if (forceScroll || isAtBottom) {
        box.scrollTop = box.scrollHeight;
      }
    });
}


// =====================
// UPDATE MESSAGE
// =====================

function updateMessage() {

  const message = document.getElementById("newMsg").value;

  const name = localStorage.getItem("boardName");
  const password = localStorage.getItem("boardPassword");
  const user = localStorage.getItem("username") || name;

  fetch("http://localhost:3000/message", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, password, message, user })
  })
  .then(res => res.json())
  .then(data => {

    if (!data.success) return alert(data.message);

    document.getElementById("newMsg").value = "";
    loadMessage(true);
  });
}


// =====================
// CLEAR TABLE
// =====================

function clearTable() {

  if (!confirm("Tyhjennetäänkö kaikki viestit?")) return;

  const adminPassword = prompt("Anna admin-salasana:");
  const name = localStorage.getItem("boardName");

  fetch(`http://localhost:3000/clear/${name}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ adminPassword })
  })
  .then(res => res.json())
  .then(data => {

    alert(data.message);

    if (data.success) {
      loadMessage(true);
    }
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

      const todayMode =
        document.getElementById("todayMode")?.checked;

      const today = new Date().toLocaleDateString();

      box.innerHTML = "";

      (data.messages || []).forEach(msg => {

        const div = document.createElement("div");

        const date = new Date(msg.time);
        const msgDate = date.toLocaleDateString();

        // 🔥 checkbox EI suodata mitään, vain muoto
        if (todayMode && msgDate === today) {
          div.innerText =
            `Tänään - ${msg.author}: ${msg.text}`;
        } else {
          div.innerText =
            `${date.toLocaleString()} - ${msg.author}: ${msg.text}`;
        }

        box.appendChild(div);
      });

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

function clearTable() {

  if (!confirm("Tyhjennetäänkö kaikki viestit?")) return;

  const adminPassword = prompt("Anna admin-salasana:");

  if (!adminPassword) return;

  const name = localStorage.getItem("boardName");

  fetch(`http://localhost:3000/clear/${name}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ adminPassword })
  })
  .then(res => res.json())
  .then(data => {

    alert(data.message);

    if (data.success) {
      loadMessage(true);
    }

  });
}

