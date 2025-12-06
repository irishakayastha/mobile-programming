// ───────────── Categories ─────────────
const categories = [
    { id: "1", name: "Science & Technology", image: "https://upload.wikimedia.org/wikipedia/commons/6/6a/Science_equipment.jpg" },
    { id: "2", name: "History & Culture", image: "https://upload.wikimedia.org/wikipedia/commons/4/42/Ancient_Greek_History.jpg" },
    { id: "3", name: "Critical Thinking & Logic", image: "https://upload.wikimedia.org/wikipedia/commons/e/eb/Brain_teasers.jpg" },
    { id: "4", name: "Current Affairs", image: "https://upload.wikimedia.org/wikipedia/commons/9/97/World_news.jpg" }
];

// ───────────── Quiz Questions ─────────────
const quizData = {
    "Science & Technology": [
        { question: "What is the chemical symbol for water?", options: ["H2O", "O2", "CO2", "NaCl"], answer: "H2O" },
        { question: "What planet is known as the Red Planet?", options: ["Mars", "Venus", "Jupiter", "Saturn"], answer: "Mars" },
        { question: "Which gas do plants absorb for photosynthesis?", options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"], answer: "Carbon Dioxide" },
        { question: "What is the speed of light?", options: ["300,000 km/s", "150,000 km/s", "1,000 km/s", "500 km/s"], answer: "300,000 km/s" },
        { question: "Who is known as the father of computers?", options: ["Charles Babbage", "Alan Turing", "Steve Jobs", "Bill Gates"], answer: "Charles Babbage" }
    ],
    "History & Culture": [
        { question: "Who was the first President of the United States?", options: ["George Washington", "Abraham Lincoln", "Thomas Jefferson", "John Adams"], answer: "George Washington" },
        { question: "In which year did World War II end?", options: ["1945", "1939", "1918", "1965"], answer: "1945" },
        { question: "Which civilization built the Pyramids of Giza?", options: ["Egyptians", "Romans", "Greeks", "Mayans"], answer: "Egyptians" },
        { question: "What is the traditional Japanese theater called?", options: ["Kabuki", "Ballet", "Opera", "Salsa"], answer: "Kabuki" },
        { question: "Which empire was ruled by Genghis Khan?", options: ["Mongol Empire", "Roman Empire", "Ottoman Empire", "British Empire"], answer: "Mongol Empire" }
    ],
    "Critical Thinking & Logic": [
        { question: "If all bloops are razzies and all razzies are lazzies, are all bloops lazzies?", options: ["Yes", "No", "Cannot tell", "Sometimes"], answer: "Yes" },
        { question: "Next number: 2, 4, 8, 16, ?", options: ["32", "24", "18", "20"], answer: "32" },
        { question: "Find the odd one out: Dog, Cat, Lion, Car", options: ["Dog", "Cat", "Lion", "Car"], answer: "Car" },
        { question: "If some cats are dogs and some dogs are birds, are some cats birds?", options: ["Yes", "No", "Cannot tell", "Always"], answer: "Cannot tell" },
        { question: "Mary is 3× older than John. John is 4. How old is Mary?", options: ["12", "7", "15", "10"], answer: "12" }
    ],
    "Current Affairs": [
        { question: "Which country recently landed a rover on the Moon?", options: ["China", "USA", "Russia", "India"], answer: "China" },
        { question: "Which organization declared the COVID-19 emergency?", options: ["WHO", "UN", "CDC", "FDA"], answer: "WHO" },
        { question: "Who is the current UN Secretary-General?", options: ["António Guterres", "Ban Ki-moon", "Kofi Annan", "Antonio Vivaldi"], answer: "António Guterres" },
        { question: "Which country hosted the 2024 Summer Olympics?", options: ["France", "Japan", "Brazil", "USA"], answer: "France" },
        { question: "What is the global initiative to reduce plastic pollution?", options: ["Plastic Free", "Clean Earth", "Zero Plastic", "Plastic Pact"], answer: "Plastic Pact" }
    ]
};

// ───────────── SCREEN SWITCHING ─────────────
function showScreen(id) {
    document.querySelectorAll(".screen").forEach(s => s.classList.add("hidden"));
    document.getElementById(id).classList.remove("hidden");
}

function goToHome() {
    showScreen("homeScreen");
    loadCategories();
}

// ───────────── LOAD CATEGORIES ─────────────
function loadCategories() {
    const container = document.getElementById("categoryContainer");
    container.innerHTML = "";

    categories.forEach(cat => {
        container.innerHTML += `
            <div class="card" onclick="startQuiz('${cat.name}')">
                <img src="${cat.image}" class="cardImage" />
                <p class="cardText">${cat.name}</p>
            </div>
        `;
    });
}

// ───────────── QUIZ LOGIC ─────────────
let currentCategory = "";
let currentIndex = 0;
let score = 0;

function startQuiz(category) {
    currentCategory = category;
    currentIndex = 0;
    score = 0;

    showScreen("quizScreen");
    loadQuizQuestion();
}

function loadQuizQuestion() {
    const questions = quizData[currentCategory];
    const q = questions[currentIndex];

    document.getElementById("quizTitle").innerText = `${currentCategory} Quiz`;
    document.getElementById("quizProgress").innerText =
        `Question ${currentIndex + 1} of ${questions.length}`;
    document.getElementById("quizQuestion").innerText = q.question;

    const optionsDiv = document.getElementById("optionsContainer");
    optionsDiv.innerHTML = "";

    q.options.forEach(op => {
        optionsDiv.innerHTML += `
            <button class="optionButton" onclick="checkAnswer('${op}')">
                ${op}
            </button>
        `;
    });
}

function checkAnswer(selected) {
    const questions = quizData[currentCategory];
    const correct = questions[currentIndex].answer;

    if (selected === correct) score++;

    if (currentIndex + 1 < questions.length) {
        currentIndex++;
        loadQuizQuestion();
    } else {
        alert(`Quiz Completed! Your score is ${score} / ${questions.length}`);
        goToHome();
    }
}
