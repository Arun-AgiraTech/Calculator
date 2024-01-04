
let screen = document.getElementById("screen");
let buttons = document.querySelectorAll("input[type='button']");
let screenValue = "";
let flag = false;
let eventFlag = false;
let id = document.getElementById("screen");
var x = document.getElementById("myAudio1");
var y = document.getElementById("myAudio2");
var b = document.getElementById("myAudio3");
var z = document.getElementById("myAudio4");

// Load calculation history from localStorage when the page loads
const history = JSON.parse(localStorage.getItem('calculationHistory')) ?? [];


window.onload = () => {
  id.style.visibility = "hidden";
  eventFlag = true;

};

/////////////////////////////////////////////////////////////////////////////////
////////////////////Event Handling Part///////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////
for (item of buttons) {
  item.addEventListener("click", (e) => {
    if(!eventFlag||e.target.value=="ON"){
      handleButtonClick(e.target.value);
    }
  });
}

document.addEventListener("keydown", (e) => {
  if(!eventFlag||e.key=="v"){
    handleKeyDown(e.key);
  }
});

function handleButtonClick(buttonText) {
  if(buttonText!="ON"){
    playButton();
  }
  console.log("Button text is ", buttonText);
  if (buttonText == "X") {
    buttonText = "*"; 
    screenValue += buttonText;
    updateScreen();
  } else if (buttonText == "AC") {
    clearScreen();
  } else if (buttonText == "⌫") {
    screenValue = screenValue.toString().slice(0, -1);
    updateScreen();
  }else if(buttonText=="ON"){
    if(flag == false){
      changeAnimation();
    }
  else {
    secondAnimation();
  }
  }
  else if (buttonText == "=") {
    calculateResult();
  } else {
    screenValue += buttonText;
    updateScreen();
  }
  localStorage.setItem("screenValue", screenValue);
}

function handleKeyDown(key) {
  if(key!="v"){
    playButton();
  }
  console.log("Key pressed is ", key);
  if (/^\d$|^[\+\-\*\/\%]$/.test(key)) {
    screenValue += key;
    updateScreen();
  } else {
    switch (key) {
      case "Enter":
        calculateResult();
        break;
      case "Escape":
        clearScreen();
        break;
      case "Backspace":
        screenValue = screenValue.toString().slice(0, -1);
        updateScreen();
        break;
        case "v":
          (flag == false) ? changeAnimation() : secondAnimation();
        break;
      default:
        break;
    }
  }
  localStorage.setItem("screenValue", screenValue);
}

/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////Functions Part/////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////

function calculateResult() {
  try {
    const result = evaluateExpression(screenValue);
    if(isNaN(result)||!isFinite(result)){
      throw new Error("Invalid Expression")
    }
    updateHistory(screenValue, result);
    screen.value = result;
    screenValue = result.toString();
    if(screenValue == 0){
      screenValue = "";
    }
  } catch (error) {
    playError();
    console.error("Error during calculation:", error.message);
    screen.value = "Error";
    screenValue = "";
  }
}



function evaluateExpression(expression) {
  const operators = /[+\-\*\/\%]/;
  const tokens = expression.match(/[+\-\*\/\%]|\d+(\.\d+)?|\(|\)/g);

  if (!tokens || tokens.length < 3) {
    throw new Error("Invalid expression");
  }

  const precedence = {
    '+': 1,
    '-': 1,
    '*': 2,
    '/': 2,
    '%': 2,
    '(': 0,
    ')': 3
  };

  const isHigherPrecedence = (op1, op2) => precedence[op1] >= precedence[op2];

  const outputQueue = [];
  const operatorStack = [];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    if (!operators.test(token) && token !== '(' && token !== ')') {
      outputQueue.push(parseFloat(token));
    } else if (token === '(') {
      operatorStack.push(token);
    } else if (token === ')') {
      while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1] !== '(') {
        outputQueue.push(operatorStack.pop());
      }
      operatorStack.pop(); // Pop the left parenthesis
    } else if (token === '-' && (i === 0 || operators.test(tokens[i - 1]) || tokens[i - 1] === '(')) {
      // Handle negative numbers
      outputQueue.push(parseFloat(tokens[i] + tokens[i + 1]));
      i++; // Skip the next token (the number after '-')
    } else {
      while (
        operatorStack.length > 0 &&
        isHigherPrecedence(operatorStack[operatorStack.length - 1], token)
      ) {
        outputQueue.push(operatorStack.pop());
      }
      operatorStack.push(token);
    }
  }

  while (operatorStack.length > 0) {
    outputQueue.push(operatorStack.pop());
  }

  const resultStack = [];
  for (let i = 0; i < outputQueue.length; i++) {
    const token = outputQueue[i];
    if (typeof token === 'number') {
      resultStack.push(token);
    } else {
      const b = resultStack.pop();
      const a = resultStack.pop();
      switch (token) {
        case '+':
          resultStack.push(a + b);
          break;
        case '-':
          resultStack.push(a - b);
          break;
        case '*':
          resultStack.push(a * b);
          break;
        case '/':
          if (b === 0) {
            throw new Error("Division by zero");
          }
          resultStack.push(a / b);
          break;
        case '%':
          resultStack.push(a % b);
          break;
        default:
          throw new Error("Invalid operator");
      }
    }
  }

  if (resultStack.length !== 1) {
    throw new Error("Invalid expression");
  }

  return resultStack.pop();
}



function updateScreen() {
  screen.value = screenValue;
}

function clearScreen() {
  screenValue = "";
  updateScreen();

  localStorage.setItem("screenValue", screenValue);
}


/////////////////////////////////////////////////////////////////////////////////
////////////////////LocalStorage///////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////


function updateHistory(expression, result) {
  // Getting existing history from local storage
  const history = JSON.parse(localStorage.getItem('calculationHistory')) || [];

  if (expression.trim() !== '' && result !== '') {
    history.push({ expression, result });

    localStorage.setItem('calculationHistory', JSON.stringify(history));
  }
}

function deleteHistory(){
  localStorage.clear();
}


/////////////////////////////////////////////////////////////////////////////////
////////////////////Animation Part///////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////

function changeAnimation() {
  eventFlag = false;
  id.style.visibility = "visible";
  playSound1();
  const originalFont = window.getComputedStyle(screen).fontFamily;
  screen.value = " casio     "
  screen.style.fontFamily = "pixel point";  

  setTimeout(() => {
    screen.value = screenValue;
    flag = true;
    screen.style.fontFamily = originalFont;
  }, 3000);
}

function secondAnimation() {
  const originalFont = window.getComputedStyle(screen).fontFamily;
  playSound2();
  screen.value = "CASIO     "
  screen.style.fontFamily = "pixel point";
  eventFlag = true;
  deleteHistory();
  
  setTimeout(() => {
    screen.value = screenValue;
    flag = false;
    screen.style.fontFamily = originalFont;
    id.style.visibility = "hidden";
    clearScreen();

  }, 2000);
}

function playSound1(){
  x.play();
}

function playSound2(){
  y.play();
}

function playError(){
  z.play();
}

function playButton(){
  b.play();
}




