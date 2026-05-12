function createBoard() {
  const name = document.getElementById("name").value;
  const password = document.getElementById("password").value;

  fetch("http://localhost:3000/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ name, password })
  })
  .then(res => res.text())
  .then(data => {
    console.log(data);
    alert(data);
  })
  .catch(err => console.error(err));
}

function deleteBoard() {
  const name = document.getElementById("name").value;

  fetch(`http://localhost:3000/delete/${name}`, {
    method: "DELETE"
  })
  .then(res => res.text())
  .then(data => {
    alert(data);
  })
  .catch(err => console.error(err));
}