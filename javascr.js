let temperature;
let weatherMessage;

document.getElementById("checkBtn").addEventListener("click", function() {
  checkWeather();
});

function checkWeather() {
  temperature = Number(document.getElementById("temperature").value);

  if (temperature >= 35) {
    weatherMessage = "It's very hot outside. Stay hydrated!";
  } else if (temperature >= 25) {
    weatherMessage = "It's warm and sunny. Enjoy the day!";
  } else if (temperature >= 15) {
    weatherMessage = "It's a bit chilly. You might need a light jacket.";
  } else if (temperature >= 0) {
    weatherMessage = "It's cold. Wear warm clothes!";
  } else if (temperature < 0) {
    weatherMessage = "It's freezing! Stay indoors if possible.";
  } else {
    weatherMessage = "Please enter a valid temperature.";
  }

  document.getElementById("result").innerHTML =
    "Temperature: " + temperature + "°C<br>" + weatherMessage;
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