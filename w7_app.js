import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getDatabase, ref, push, set, get, onValue, update, remove, child } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";

// ---------------- FIREBASE CONFIG ----------------
const firebaseConfig = {
  apiKey: "AIzaSyCK0KlVC-_ubcjKVfUUSgUVUsZm0L0x4QY",
  authDomain: "quizverse-fcdbd.firebaseapp.com",
  databaseURL: "https://quizverse-fcdbd-default-rtdb.firebaseio.com",
  projectId: "quizverse-fcdbd",
  storageBucket: "quizverse-fcdbd.appspot.com",
  messagingSenderId: "871857902046",
  appId: "1:871857902046:web:0416903be5734d5be64d4f"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const profileRef = ref(db, "profiles");
const leaderboardRef = ref(db, "leaderboard");
const scoresRef = ref(db, "scores");
const userQuestionsRef = ref(db, "userQuestions");

// ---------------- GLOBALS ----------------
let currentCategory = "";
let curQ = [];
let idx = 0;
let score = 0;
let questionCount = 10;
let perQuestionPoints = 10;
let mode = "relax";
let timerInterval = null;
let timePerQuestion = 12;
let remainingTime = 0;
let activeProfile = null;

// ---------------- NAV ----------------
function showPage(id){
  $(".page").hide();
  $("#"+id).show();
}
showPage("landingPage");
$("#playNowBtn").on("click", ()=> showPage("homePage"));

// Overlay for sidebar
(function ensureOverlay(){
  if(!document.getElementById("menuOverlay")){
    const ov = document.createElement("div");
    ov.id = "menuOverlay";
    ov.style.position = "fixed";
    ov.style.top = "0";
    ov.style.left = "0";
    ov.style.width = "100%";
    ov.style.height = "100%";
    ov.style.background = "rgba(0,0,0,0.45)";
    ov.style.zIndex = "9998";
    ov.style.display = "none";
    ov.style.webkitTapHighlightColor = "transparent";
    document.body.appendChild(ov);
  }
})();
function showOverlay(){ const ov = document.getElementById("menuOverlay"); if(ov){ ov.style.display = "block"; document.body.style.overflow = "hidden"; } }
function hideOverlay(){ const ov = document.getElementById("menuOverlay"); if(ov){ ov.style.display = "none"; document.body.style.overflow = ""; } }

function closeMenu(){
  $("#sideMenu").removeClass("open").attr("aria-hidden", "true");
  hideOverlay();
}
$("#hamburgerBtn").on("click", ()=>{
  $("#sideMenu").toggleClass("open");
  const isOpen = $("#sideMenu").hasClass("open");
  $("#sideMenu").attr("aria-hidden", String(!isOpen));
  if(isOpen) showOverlay(); else hideOverlay();
});
$("#closeMenu").on("click", closeMenu);
$("#menuOverlay").on("click", closeMenu);
$(".menuBtn").on("click", closeMenu);

$(".aboutBtn").on("click", ()=>{ showPage("aboutPage"); });
$(".leaderboardBtn").on("click", ()=>{ showPage("leaderboardPage"); updateLeaderboard(); });
$(".profileBtn").on("click", ()=>{ showPage("profilePage"); });
$(".addQuestionBtn").on("click", ()=>{ showPage("addQuestionPage"); });
$(".statsBtn").on("click", ()=>{ showPage("statsPage"); loadStats(); });

$("#backToHome, #lbBack, #profileBack, #aboutBack, #aqBack, #statsBack").on("click", ()=> showPage("homePage"));

$("#difficultySelect").on("change", function(){
  const v = $(this).val();
  if(v === "easy"){ questionCount = 5; perQuestionPoints = 10; }
  else if(v === "medium"){ questionCount = 10; perQuestionPoints = 10; }
  else if(v === "hard"){ questionCount = 15; perQuestionPoints = 10; }
});
$("#modeSelect").on("change", function(){ mode = $(this).val(); });

// ---------------- ACTIVE PROFILE ----------------
function setActive(id, data){
  if(!id || !data) return;
  activeProfile = { id, username: data.username || data.fullName || "Unknown" };
  localStorage.setItem("activeProfile", JSON.stringify(activeProfile));

  $("#activeProfileInside").text(activeProfile.username);
  $("#activeUsernameLabel").text("Active: " + activeProfile.username);
}
function restoreActiveProfile(){
  try{
    const raw = localStorage.getItem("activeProfile");
    if(!raw) return;
    const ap = JSON.parse(raw);
    if(ap && ap.id){
      get(ref(db, "profiles/"+ap.id)).then(s=>{
        const d = s.exists() ? s.val() : { username: ap.username };
        setActive(ap.id, d);
      }).catch(()=> setActive(ap.id, { username: ap.username }));
    }
  }catch{}
}
$(document).ready(()=>{
  $("#activeProfileInside").text("No profile selected");
  $("#activeUsernameLabel").text("No profile selected");
  restoreActiveProfile();
});

// ---------------- PROFILES CRUD ----------------
onValue(profileRef, snap=>{
  const $list = $("#profileList");
  $list.empty();
  if(!snap.exists()){
    $list.html("<li style='color:#fff;padding:10px;'>No profiles yet. Create one above.</li>");
    return;
  }
  snap.forEach(child=>{
    const d = child.val(), id = child.key;
    const li = `
      <li data-id="${id}">
        <div class="profile-row"><span class="profile-label">Full Name:</span> ${escapeHtml(d.fullName || "")}</div>
        <div class="profile-row"><span class="profile-label">Username:</span> ${escapeHtml(d.username || "")}</div>
        <div class="profile-row"><span class="profile-label">Email:</span> ${escapeHtml(d.email || "")}</div>
        <div class="profile-row"><span class="profile-label">Favorite Category:</span> ${escapeHtml(d.favCategory || "")}</div>
        <div class="profile-row"><span class="profile-label">Age:</span> ${escapeHtml(d.age ?? "")}</div>
        <div class="profile-row"><span class="profile-label">Gender:</span> ${escapeHtml(d.gender || "")}</div>
        <div class="profile-actions">
          <button class="useBtn">Use</button>
          <button class="editBtn">Edit</button>
          <button class="delBtn">Delete</button>
        </div>
      </li>`;
    $list.append(li);
  });
});

// Delegated actions
$("#profileList").on("click", ".useBtn", async function(){
  const id = $(this).closest("li").data("id");
  const snap = await get(ref(db,"profiles/"+id));
  if(snap.exists()){
    setActive(id, snap.val());
    updateLeaderboard(); // refresh view
  } else {
    alert("Profile not found.");
  }
});

$("#profileList").on("click", ".editBtn", async function(){
  const id = $(this).closest("li").data("id");
  const snap = await get(ref(db,"profiles/"+id));
  if(!snap.exists()){ alert("Profile not found."); return; }
  const d = snap.val();
  $("#recordId").val(id);
  $("#fullName").val(d.fullName || "");
  $("#email").val(d.email || "");
  $("#username").val(d.username || "");
  $("#favCategory").val(d.favCategory || "");
  $("#age").val(d.age || "");
  $("#gender").val(d.gender || "");
  showPage("profilePage");
});

$("#profileList").on("click", ".delBtn", function(){
  const id = $(this).closest("li").data("id");
  if(!confirm("Delete profile? This will also remove their leaderboard entry and scores.")) return;

  remove(ref(db,"profiles/"+id)).then(()=>{
    remove(ref(db,"leaderboard/"+id)).catch(()=>{});
    get(scoresRef).then(snapScores=>{
      snapScores.forEach(sChild=>{
        const sVal = sChild.val();
        if(sVal.profileId === id){
          remove(ref(db, "scores/" + sChild.key)).catch(()=>{});
        }
      });
    }).catch(()=>{});
    if(activeProfile && activeProfile.id === id){
      localStorage.removeItem("activeProfile");
      activeProfile = null;
      $("#activeProfileInside").text("No profile selected");
      $("#activeUsernameLabel").text("No profile selected");
    }
  }).catch(err=>{
    console.error("Delete failed:", err);
    alert("Delete failed. Check console for details.");
  });
});

// Create/update profile
$("#profileForm").on("submit", async (e)=>{
  e.preventDefault();
  const id = $("#recordId").val();
  const data = {
    fullName: $("#fullName").val().trim(),
    email: $("#email").val().trim(),
    username: $("#username").val().trim(),
    favCategory: $("#favCategory").val().trim(),
    age: $("#age").val() ? Number($("#age").val()) : null,
    gender: $("#gender").val()
  };
  if(!data.username){ alert("Username is required."); return; }
  if(!data.fullName){ alert("Full name is required."); return; }

  try{
    if(id){
      await update(ref(db,"profiles/"+id), data);
      await update(ref(db,"leaderboard/"+id), { username: data.username }).catch(()=>{});
      setActive(id, data);
    }else{
      const newRef = push(profileRef);
      await set(newRef, data);
      setActive(newRef.key, data);
      await set(ref(db,"leaderboard/"+newRef.key), {
        username: data.username || data.fullName || "Unknown", total: 0
      }).catch(()=>{});
    }
    $("#profileForm")[0].reset();
    $("#recordId").val("");
    showPage("homePage");
  }catch(err){
    console.error("Save profile error:", err);
    alert("Failed to save profile. Check console for details.");
  }
});

// ---------------- QUESTIONS (built-in) ----------------
const builtInQuestions = {
  science: [
    {q:"What is the chemical formula for water?", options:["H2O","O2","CO2"], ans:0},
    {q:"Which planet is known as the Red Planet due to its color?", options:["Mars","Venus","Jupiter"], ans:0},
    {q:"Who developed the Theory of Relativity?", options:["Albert Einstein","Isaac Newton","Galileo Galilei"], ans:0},
    {q:"During photosynthesis, which gas is produced by plants?", options:["Oxygen","Carbon Dioxide","Nitrogen"], ans:0},
    {q:"What is the hardest naturally occurring substance on Earth?", options:["Diamond","Gold","Iron"], ans:0},
    {q:"Which process powers the Sun and produces sunlight?", options:["Nuclear fusion","Solar panels","Electricity"], ans:0},
    {q:"Which particle has a negative electrical charge?", options:["Electron","Proton","Neutron"], ans:0},
    {q:"What is the most abundant gas in Earth's atmosphere?", options:["Nitrogen","Oxygen","Carbon Dioxide"], ans:0},
    {q:"Which force keeps planets in orbit around the Sun?", options:["Gravity","Magnetism","Friction"], ans:0},
    {q:"What is the approximate speed of light in a vacuum?", options:["299,792 km/s","150,000 km/s","1,000 km/s"], ans:0}
  ],
  history: [
    {q:"Who was the first President of the United States?", options:["George Washington","Abraham Lincoln","Thomas Jefferson"], ans:0},
    {q:"Which empire built the Colosseum in Rome?", options:["Roman Empire","Greek Empire","Persian Empire"], ans:0},
    {q:"In which year did World War II end?", options:["1945","1939","1918"], ans:0},
    {q:"Who is credited with discovering America in 1492?", options:["Christopher Columbus","Leif Erikson","Ferdinand Magellan"], ans:0},
    {q:"Who was nicknamed the 'Iron Lady'?", options:["Margaret Thatcher","Indira Gandhi","Angela Merkel"], ans:0},
    {q:"In which year did the French Revolution begin?", options:["1789","1776","1804"], ans:0},
    {q:"Who was the first Roman Emperor?", options:["Augustus","Nero","Julius Caesar"], ans:0},
    {q:"Where was the Magna Carta signed?", options:["England","France","Italy"], ans:0},
    {q:"Who was Genghis Khan?", options:["Mongol leader","Egyptian Pharaoh","Roman general"], ans:0},
    {q:"Which civilization built Machu Picchu?", options:["Inca","Maya","Aztec"], ans:0}
  ],
  critical: [
    {q:"All roses are flowers. Some flowers fade fast. What can be inferred?", options:["Some roses may fade fast","All roses fade fast","Roses are not flowers"], ans:0},
    {q:"Cats are mammals, and some mammals are furry. What can be said about cats?", options:["Some cats may be furry","All cats are furry","No cats are furry"], ans:0},
    {q:"If it rains, the ground gets wet. It is raining now. What happens?", options:["The ground gets wet","Nothing happens","The ground dries"], ans:0},
    {q:"If today is Monday, what day will it be 3 days later?", options:["Thursday","Tuesday","Friday"], ans:0},
    {q:"Birds usually fly. Penguins are birds. What is true?", options:["Penguins can fly","Penguins cannot fly","Cannot say"], ans:1},
    {q:"If 2+2=4, 4+4=8, then what is 8+8?", options:["16","14","18"], ans:0},
    {q:"John is taller than Mary, and Mary is taller than Sam. Who is the shortest?", options:["Sam","John","Mary"], ans:0},
    {q:"Every A is B, some B are C. What can be concluded?", options:["Some A are C","All A are C","No A are C"], ans:0},
    {q:"If the first two statements are true, and the third is false, what is the overall truth?", options:["Depends","True","False"], ans:0},
    {q:"If P implies Q, and P is true, what can be said about Q?", options:["Q must be true","P must be false","Cannot say"], ans:0}
  ],
  current: [
    {q:"Which international organization regularly releases global climate reports?", options:["United Nations","FIFA","World Bank"], ans:0},
    {q:"What is the global inflation rate generally considered to be?", options:["It varies by country and year","Always 2%","Always 5%"], ans:0},
    {q:"In which country was COVID-19 first discovered?", options:["China","USA","Italy"], ans:0},
    {q:"Who won the most recent Nobel Peace Prize?", options:["Abiy Ahmed","António Guterres","ICRC"], ans:0},
    {q:"Which major technology expo is held annually in Las Vegas?", options:["CES","FIFA World Cup","Olympics"], ans:0},
    {q:"In which year was the latest iPhone released?", options:["2023","2022","2021"], ans:0},
    {q:"Where is the headquarters of the World Health Organization located?", options:["Geneva","New York City","London"], ans:0},
    {q:"What is the main focus of UNICEF?", options:["Children's welfare","Adult education","Elderly care"], ans:0},
    {q:"How often is the COP climate summit held?", options:["Annually","Monthly","Weekly"], ans:0},
    {q:"In which year was Bitcoin created?", options:["2009","2010","2012"], ans:0}
  ]
};

// ---------------- QUIZ ----------------
$(".card").on("click", async function(){
  const cat = $(this).data("category");
  if(!cat) return;

  currentCategory = cat;
  score = 0;
  idx = 0;

  const userSnap = await get(child(userQuestionsRef, cat)).catch(()=>null);
  const userQs = [];
  if(userSnap && userSnap.exists()){
    userSnap.forEach(c => {
      const v = c.val();
      if(v.q && Array.isArray(v.options) && typeof v.ans === "number") userQs.push(v);
    });
  }

  let pool = [...(builtInQuestions[cat] || []), ...userQs];
  if(pool.length === 0){
    alert("No questions available in this category.");
    return;
  }

  // Shuffle options per question, keep correctness mapping
  pool = pool.map(q => {
    const mapped = q.options.map((opt, i) => ({ text: opt, isCorrect: i === q.ans }));
    mapped.sort(() => Math.random() - 0.5);
    return {
      q: q.q,
      options: mapped.map(o => o.text),
      ans: mapped.findIndex(o => o.isCorrect)
    };
  });

  curQ = pool.slice(0, questionCount);
  showPage("quizPage");
  showQuestion();
});

function showQuestion(){
  stopTimer();
  if(idx >= curQ.length){
    saveScore();
    return;
  }
  $("#quizTitle").text((currentCategory || "").toUpperCase());
  $("#quizProgress").text(`${idx+1} / ${curQ.length}`);

  const q = curQ[idx];
  $("#quizQuestion").text(q.q);
  $("#quizOptions").empty();
  q.options.forEach((opt, i) => {
    const b = $(`<button class="optionBtn">${opt}</button>`);
    b.on("click", ()=> selectAnswer(i));
    $("#quizOptions").append(b);
  });

  if(mode === "speed"){
    remainingTime = timePerQuestion;
    $("#quizTimer").removeClass("hidden");
    $("#timerValue").text(remainingTime);
    timerInterval = setInterval(()=>{
      remainingTime--;
      $("#timerValue").text(remainingTime);
      if(remainingTime <= 0){
        stopTimer();
        selectAnswer(-1);
      }
    }, 1000);
  } else {
    $("#quizTimer").addClass("hidden");
    $("#timerValue").text(0);
  }
}

function stopTimer(){
  if(timerInterval){
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function selectAnswer(selected){
  stopTimer();
  const q = curQ[idx];

  // Visual feedback
  const buttons = $("#quizOptions .optionBtn");
  buttons.each((i, el)=>{
    if(i === q.ans) $(el).addClass("optionCorrect");
    if(selected !== -1 && i === selected && selected !== q.ans) $(el).addClass("optionWrong");
    $(el).prop("disabled", true);
  });

  if(selected === q.ans) score += perQuestionPoints;

  setTimeout(()=>{
    idx++;
    showQuestion();
  }, 600);
}

async function saveScore(){
  if(!activeProfile) {
    alert("No active profile. Score will not be saved.");
  } else {
    const sc = {
      profileId: activeProfile.id,
      username: activeProfile.username,
      category: currentCategory,
      score: score,
      date: new Date().toISOString()
    };
    await push(scoresRef, sc).catch(()=>{});
    const lbRef = ref(db, "leaderboard/"+activeProfile.id);
    const snap = await get(lbRef).catch(()=>null);
    const prevTotal = snap && snap.exists() ? (snap.val().total || 0) : 0;
    await update(lbRef, { total: prevTotal + score }).catch(()=>{});
  }
  // show result
  alert(`Your score: ${score}`);
  showPage("homePage");
}

// ---------------- LEADERBOARD ----------------
function updateLeaderboard(){
  get(leaderboardRef).then(snap=>{
    const data = [];
    snap.forEach(c=>{
      const d = c.val();
      data.push({ id: c.key, username: d.username || "Unknown", total: d.total || 0 });
    });
    data.sort((a,b)=> b.total - a.total);

    const $list = $("#leaderboardList");
    $list.empty();
    const table = $(`
      <table>
        <thead><tr><th>#</th><th>User</th><th>Total</th></tr></thead>
        <tbody></tbody>
      </table>
    `);
    data.forEach((u,i)=>{
      table.find("tbody").append(
        `<tr><td>${i+1}</td><td>${escapeHtml(u.username)}</td><td>${u.total}</td></tr>`
      );
    });
    $list.append(table);
  }).catch(()=>{});
}

// ---------------- STATS ----------------
async function loadStats(){
  try{
    const [scoresSnap, profilesSnap] = await Promise.all([get(scoresRef), get(profileRef)]);
    const usernames = {};
    if(profilesSnap.exists()){
      profilesSnap.forEach(p=>{
        const d = p.val();
        usernames[p.key] = d.username || d.fullName || p.key;
      });
    }
    const stats = {};
    if(scoresSnap.exists()){
      scoresSnap.forEach(c=>{
        const d = c.val();
        if(!stats[d.profileId]) stats[d.profileId] = { total:0, count:0, categories:{} };
        stats[d.profileId].total += d.score;
        stats[d.profileId].count++;
        stats[d.profileId].categories[d.category] = (stats[d.profileId].categories[d.category] || 0) + d.score;
      });
    }
    const $content = $("#statsContent");
    $("#statsSummary").text("");
    $("#badgesArea").empty();
    for(const pid in stats){
      const s = stats[pid];
      const name = usernames[pid] || pid;
      $content.append(
        `<div><b>${escapeHtml(name)}</b>: Total Score=${s.total}, Attempts=${s.count}, Category Breakdown=${escapeHtml(JSON.stringify(s.categories))}</div>`
      );
    }
  }catch(e){
    console.error(e);
  }
}

// ---------------- ADD QUESTION ----------------
$("#addQuestionForm").on("submit", async (e)=>{
  e.preventDefault();
  if(!activeProfile){ alert("Select profile to submit question."); return; }

  const cat = $("#aqCategory").val();
  const qText = $("#aqQuestion").val().trim();
  const opts = [$("#opt0").val().trim(), $("#opt1").val().trim(), $("#opt2").val().trim()];
  const ans = Number($("#aqAnswer").val());

  if(!cat || !qText || opts.some(o=>!o) || Number.isNaN(ans)) { alert("Fill all fields properly."); return; }
  if(ans < 0 || ans >= opts.length){ alert("Correct answer index must be 0, 1, or 2."); return; }

  try{
    const newQRef = push(child(userQuestionsRef, cat));
    await set(newQRef, { q: qText, options: opts, ans: ans });
    $("#addQuestionForm")[0].reset();
    alert("Question added successfully!");
    showPage("homePage");
  }catch(err){
    console.error(err);
    alert("Failed to add question. Check console.");
  }
});

// ---------------- UTIL ----------------
function escapeHtml(text) {
  if(text === null || text === undefined) return "";
  return String(text).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}
