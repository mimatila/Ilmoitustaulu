let loading = false;
let refreshInterval = null;

document.addEventListener("DOMContentLoaded", () => {
  const el = document.getElementById("boardCount");

  if (el) {
    el.innerText = "Ladataan...";

    fetch("http://localhost:3000/boards/count")
      .then(res => res.json())
      .then(data => {
        el.innerText = `Tauluja: ${data.count ?? 0}`;
      })
      .catch(() => {
        el.innerText = "Tauluja ei saatu";
      });
  }

  initApp();
});

// =====================
// APP INIT
// =====================

function initApp() {
  bindUI();
  autoLoginFill();

  if (document.getElementById("message")) {
    initBoard();
  }

}


// =====================
// UI EVENTS
// =====================

function bindUI() {

  const loginBtn = document.getElementById("ilmoitustaulu");
  if (loginBtn) {
    loginBtn.addEventListener("click", loginBoard);
  }

  document.addEventListener("keydown", (e) => {
    // estää Enter bugit inputeissa
    if (e.key === "Enter" && !isTypingField(e.target)) {
      const btn = document.getElementById("ilmoitustaulu");
      if (btn) btn.click();
    }
  });

  const homeBtn = document.getElementById("koti");
  if (homeBtn) homeBtn.addEventListener("click", koti);

  const msgInput = document.getElementById("newMsg");
  if (msgInput) {
    msgInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        updateMessage();
      }
    });
  }

  document.addEventListener("change", (e) => {
  if (e.target?.id === "todayMode") {
    loadMessage(true);
  }
});
}


// =====================
// SAFE HELPERS
// =====================

function isTypingField(el) {
  return el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA");
}

function getBoardName() {
  return localStorage.getItem("boardName");
}


// =====================
// AUTO LOGIN FILL
// =====================

function autoLoginFill() {

  const name = localStorage.getItem("boardName") || "";
  const boardPassword = localStorage.getItem("boardPassword") || "";
  const username = localStorage.getItem("username") || "";

  const loggedIn = localStorage.getItem("loggedIn");
  const skip = sessionStorage.getItem("skipAutoLogin");

  const nameInput = document.getElementById("name");

  if (!nameInput) return;

  if (!skip && loggedIn === "true") {
    window.location.href = "board.html";
    return;
  }

  nameInput.value = name;
  document.getElementById("password").value = boardPassword;
  document.getElementById("username").value = username;
}


// =====================
// BOARD INIT
// =====================


function initBoard() {

  const name = getBoardName();

  const boardNameEl = document.getElementById("boardTitle");
  const box = document.getElementById("message");

  if (!boardNameEl || !box || !name) return;

  boardNameEl.innerText = name;

  loadMessage(true);

  if (refreshInterval) clearInterval(refreshInterval);

// eka lataus heti
if (!document.hidden) {
  loadMessage(false);
}

// automaattipäivitys
refreshInterval = setInterval(() => {
  console.log("REFRESH TICK");
  if (!document.hidden) {
    loadMessage(false);
  }
}, 5000);

/*
  setTimeout(() => {
  loadMessage(true);
}, 200);*/

}



// =====================
// LOAD MESSAGES
// =====================

function loadMessage(forceScroll = false) {

  const box = document.getElementById("message");
  if (!box) return;

  if (loading) return;
  loading = true;

  console.log("checkbox state:", document.getElementById("todayMode")?.checked);

  const name = getBoardName();
  if (!name) {
    loading = false;
    return;
  }

  fetch(`http://localhost:3000/board/${name}`)
    .then(res => res.json())
    .then(data => {

      const isAtBottom =
        box.scrollTop + box.clientHeight >= box.scrollHeight - 10;

      box.innerHTML = "";

      (data.messages || []).forEach(msg => {
        const div = document.createElement("div");

        const date = new Date(msg.time);
        const now = new Date();

        const isToday =
          date.getDate() === now.getDate() &&
          date.getMonth() === now.getMonth() &&
          date.getFullYear() === now.getFullYear();

        const todayMode = document.getElementById("todayMode")?.checked;

        if (todayMode && isToday) {
          div.innerText = `Tänään: ${msg.author}: ${msg.text}`;
        } else {
          div.innerText = `${date.toLocaleString()} - ${msg.author}: ${msg.text}`;
        }

        box.appendChild(div);
      });

      if (forceScroll || isAtBottom) {
        box.scrollTop = box.scrollHeight;
      }
    })
    .catch(console.error)
    .finally(() => {
      loading = false;
    });
}


// =====================
// UPDATE MESSAGE
// =====================

function updateMessage() {

  const messageEl = document.getElementById("newMsg");
  if (!messageEl) return;

  const message = messageEl.value;

  const name = localStorage.getItem("boardName");
  const boardPassword = localStorage.getItem("boardPassword");
  const user = localStorage.getItem("username") || name;

  fetch("http://localhost:3000/message", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, boardPassword, message, user })
  })
  .then(res => res.json())
  .then(data => {

    if (!data.success) return alert(data.message);

    messageEl.value = "";
    loadMessage(true);
  });
}


// =====================
// LOGIN
// =====================

function loginBoard() {

  const name = document.getElementById("name").value;
  const boardPassword = document.getElementById("password").value;
  const username = document.getElementById("username").value;

  fetch("http://localhost:3000/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, boardPassword, username })
  })
  .then(res => res.json())
  .then(data => {

    if (!data.success) return alert(data.message);

    localStorage.setItem("boardName", name);
    localStorage.setItem("boardPassword", boardPassword);
    localStorage.setItem("username", username);
    localStorage.setItem("loggedIn", "true");

    window.location.href = "board.html";
    
  });
}


// =====================
// CREATE BOARD
// =====================

function createBoard() {

  const name = document.getElementById("name").value;
  const boardPassword = document.getElementById("password").value;
  const username = document.getElementById("username").value;

  const ownerPassword = prompt("Anna owner-salasana:");

  if (!ownerPassword) {
    alert("Owner-salasana vaaditaan");
    return;
  }

  fetch("http://localhost:3000/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      boardPassword,
      ownerPassword,
      username
    })
  })
  .then(res => res.json())
  .then(data => {

    if (!data.success) {
      alert(data.message);
      return;
    }

    localStorage.setItem("boardName", name);
    localStorage.setItem("boardPassword", boardPassword);
    localStorage.setItem("username", username);

    alert(data.message);
  });
}


// =====================
// DELETE BOARD
// =====================

function deleteBoard() {

  const name = localStorage.getItem("boardName");
  const ownerPassword = prompt("Anna owner-salasana:");

  if (!confirm("Haluatko varmasti poistaa taulun?")) return;

  fetch(`http://localhost:3000/delete/${name}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ownerPassword })
  })
  .then(res => res.json())
  .then(data => {

    alert(data.message);

    if (data.success) {
      localStorage.clear();
      window.location.href = "index.html";
    }
  });
}


// =====================
// CLEAR TABLE
// =====================

function clearTable() {

  const name = localStorage.getItem("boardName");
  const ownerPassword = prompt("Anna owner-salasana:");
  const username = localStorage.getItem("username");

  if (!confirm("Tyhjennetäänkö kaikki viestit?")) return;

  fetch(`http://localhost:3000/clear/${name}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ownerPassword,
      username
    })
  })
  .then(res => res.json())
  .then(data => {

    alert(data.message);

    if (data.success) {
      loadMessage(true);
    }
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

document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    loadMessage(false);
  }
});

