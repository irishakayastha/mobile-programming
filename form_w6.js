import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getDatabase, ref, set, push, update, remove, onValue }
  from "https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCK0KlVC-_ubcjKVfUUSgUVUsZm0L0x4QY",
  authDomain: "quizverse-fcdbd.firebaseapp.com",
  projectId: "quizverse-fcdbd",
  storageBucket: "quizverse-fcdbd.firebasestorage.app",
  messagingSenderId: "871857902046",
  appId: "1:871857902046:web:0416903be5734d5be64d4f",
  measurementId: "G-NRF2ZJH28L"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const userRef = ref(db, "admin");

const form = document.getElementById("userForm");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const userIdInput = document.getElementById("userId");
const userTableBody = document.getElementById("userTableBody");

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const name = nameInput.value;
  const email = emailInput.value;
  const userId = userIdInput.value;

  if (userId) {
    update(ref(db, "admin/" + userId), { name, email });
  } else {
    const newUserRef = push(userRef);
    set(newUserRef, { name, email });
  }

  form.reset();
  userIdInput.value = "";
});

onValue(userRef, (snapshot) => {
  userTableBody.innerHTML = "";

  snapshot.forEach((child) => {
    const data = child.val();

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${data.name}</td>
      <td>${data.email}</td>
      <td class="text-center">
        <button class="btn btn-warning btn-sm" onclick="editUser('${child.key}', '${data.name}', '${data.email}')">Edit</button>
        <button class="btn btn-danger btn-sm" onclick="deleteUser('${child.key}')">Delete</button>
      </td>
    `;
    userTableBody.appendChild(tr);
  });
});

window.editUser = function (id, name, email) {
  nameInput.value = name;
  emailInput.value = email;
  userIdInput.value = id;
};

window.deleteUser = function (id) {
  if (confirm("Delete user?")) {
    remove(ref(db, "admin/" + id));
  }
};
