// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getDatabase, ref, set, push, update, remove, onValue, get } 
  from "https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCK0KlVC-_ubcjKVfUUSgUVUsZm0L0x4QY",
  authDomain: "quizverse-fcdbd.firebaseapp.com",
  projectId: "quizverse-fcdbd",
  storageBucket: "quizverse-fcdbd.firebasestorage.app",
  messagingSenderId: "871857902046",
  appId: "1:871857902046:web:0416903be5734d5be64d4f",
  measurementId: "G-NRF2ZJH28L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Function to write user data
function writeUserData(userId, firstname, lastname, email, phone, age){
  set(ref(db, 'users/' + userId), {
    firstname,
    lastname,
    email,
    phone,
    age
  });
}

// Add Test Users
updateUserData(1, { age: 21 });
updateUserData(2, { age: 23 });
updateUserData(3, { age: 24 });
updateUserData(4, { age: 25 });
updateUserData(5, { age: 26 });
updateUserData(6, { age: 27 });
updateUserData(7, { age: 28 });
updateUserData(8, { age: 29 });
updateUserData(9, { age: 30 });
updateUserData(10, { age: 31 });
// Read data function
function readUserData(){
  const userRef = ref(db, 'users');
  get(userRef).then(snapshot => {
    snapshot.forEach(child => console.log(child.val()));
  });
}
readUserData();

// Update data
function updateUserData(userId, updatedData) {
  update(ref(db, 'users/' + userId), updatedData)
    .then(() => console.log("User updated"))
    .catch(err => console.error(err));
}


// Delete user
function deleteUserData(userId) {
  remove(ref(db, 'users/' + userId))
    .then(() => console.log("User deleted"))
    .catch(err => console.error(err));
}
