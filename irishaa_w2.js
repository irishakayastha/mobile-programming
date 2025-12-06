let marks;
let grade;
let message;

document.getElementById("checkBtn").addEventListener("click", function() {
  checkResult();
});

function checkResult() {
  marks = Number(document.getElementById("marks").value);

  if (marks >= 90 && marks <= 100) {
    grade = "A+";
    message = "Excellent! You passed with distinction.";
  } else if (marks >= 80) {
    grade = "A";
    message = "Very good! You passed.";
  } else if (marks >= 70) {
    grade = "B";
    message = "Good job! You passed.";
  } else if (marks >= 50) {
    grade = "C";
    message = "You passed, but there is room for improvement.";
  } else if (marks >= 0 && marks < 50) {
    grade = "F";
    message = "Sorry, you failed. Try again!";
  } else {
    message = "Please enter a valid number between 0 and 100.";
  }

  document.getElementById("result").innerHTML =
    "Marks: " + marks + "<br>Grade: " + (grade || "N/A") + "<br>" + message;
}

function add() {
  let a = 4, b = 3;
  return a + b;
}

function subtract() {
  let a = 4, b = 3;
  return a - b;
}

function multiply() {
  let a = 4, b = 3;
  return a * b;
}

function divide() {
  let a = 4, b = 3;
  return a / b;
}

function displaySum() {
  document.getElementById("toggleText1").innerHTML = "Sum: " + add();
}

function displaySub() {
  document.getElementById("toggleText2").innerHTML = "Difference: " + subtract();
}

function displayMul() {
  document.getElementById("toggleText3").innerHTML = "Product: " + multiply();
}

function displayDiv() {
  document.getElementById("toggleText4").innerHTML = "Quotient: " + divide();
}
