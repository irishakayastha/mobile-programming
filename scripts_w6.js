import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import {getDatabase, ref, push, set, onValue, update, remove} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCK0KlVC-_ubcjKVfUUSgUVUsZm0L0x4QY",
  authDomain: "quizverse-fcdbd.firebaseapp.com",
  databaseURL: "https://quizverse-fcdbd-default-rtdb.firebaseio.com", 
  projectId: "quizverse-fcdbd",
  storageBucket: "quizverse-fcdbd.appspot.com",
  messagingSenderId: "871857902046",
  appId: "1:871857902046:web:0416903be5734d5be64d4f",
  measurementId: "G-NRF2ZJH28L"};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const profileRef = ref(db, "profiles");
// CREATE / UPDATE
document.getElementById("profileForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const id = document.getElementById("recordId").value;
  const fullName = document.getElementById("fullName").value;
  const email = document.getElementById("email").value;
  const username = document.getElementById("username").value;
  const favCategory = document.getElementById("favCategory").value;
  const age = Number(document.getElementById("age").value);
  const gender = document.getElementById("gender").value;
  const data = { fullName, email, username, favCategory, age, gender };

  if (id) {
    update(ref(db, "profiles/" + id), data);
  } else {
    const newRef = push(profileRef);
    set(newRef, data);
  }

  document.getElementById("profileForm").reset();
  document.getElementById("recordId").value = "";
});

// READ (Realtime)
const profileList = document.getElementById("profileList");

onValue(profileRef, (snapshot) => {
  profileList.innerHTML = "";

  snapshot.forEach((child) => {
    const data = child.val();
    const id = child.key;

    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${data.username}</strong> (${data.fullName})<br>
      Email: ${data.email}<br>
      Favorite Category: ${data.favCategory}<br>
      Age: ${data.age}<br>
      Gender: ${data.gender}
      <div class="actions">
        <button class="update-btn" onclick="editRecord('${id}', '${data.fullName}', '${data.email}', '${data.username}', '${data.favCategory}', 
        ${data.age}, '${data.gender}')">Edit</button>
        <button class="delete-btn" onclick="deleteRecord('${id}')">Delete</button>
      </div>
    `;
    profileList.appendChild(li);
  });
});

// EDIT
window.editRecord = function(id, fullName, email, username, favCategory, age, gender) {
  document.getElementById("recordId").value = id;
  document.getElementById("fullName").value = fullName;
  document.getElementById("email").value = email;
  document.getElementById("username").value = username;
  document.getElementById("favCategory").value = favCategory;
  document.getElementById("age").value = age;
  document.getElementById("gender").value = gender;
};

// DELETE
window.deleteRecord = function(id) {
  remove(ref(db, "profiles/" + id));
};
