// LOGIN
if (document.getElementById("liity")) {
  document.getElementById("liity").addEventListener("click", loginBoard);
}

function loginBoard() {
  const name = document.getElementById("name").value;
  const password = document.getElementById("password").value;

  fetch("http://localhost:3000/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, password })
  })
  .then(res => res.json())
  .then(data => {
    if (!data.success) return alert(data.message);

    localStorage.setItem("boardName", name);
    localStorage.setItem("boardPassword", password);
    window.location.href = "board.html";
  });
}

function createBoard() {
  const name = document.getElementById("name").value;
  const password = document.getElementById("password").value;

  const adminPassword = prompt("Anna admin-salasana:");

  fetch("http://localhost:3000/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, password, adminPassword })
  })
  .then(res => res.json())
  .then(data => alert(data.message));
}

function deleteBoard() {
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

    alert(data.message);
  });
}

// BOARD
if (document.getElementById("boardName")) {

  const boardName = localStorage.getItem("boardName");

  document.getElementById("boardName").innerText = boardName;

function loadMessage() {

  fetch(`http://localhost:3000/board/${boardName}`)
    .then(async res => {

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        alert(data?.message || "Virhe haussa");
        return;
      }

      return data;
    })
    .then(data => {

      if (!data) return;

      const box = document.getElementById("message");
      box.innerHTML = "";

      (data.messages || []).forEach(msg => {
        const p = document.createElement("p");
        p.innerText = msg;
        box.appendChild(p);
      });

    });

}

  window.updateMessage = function () {

  const message = document.getElementById("newMsg").value;

  const name = localStorage.getItem("boardName");
  const password = localStorage.getItem("boardPassword");

  fetch("http://localhost:3000/message", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      password,
      message
    })
  })
  .then(res => res.json())
  .then(data => {
  if (!data.success) return alert(data.message);

  loadMessage();

  document.getElementById("newMsg").value = "";
});
  
}
loadMessage();
  
}