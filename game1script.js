// version 2020.09.05

let questions;
let unfilteredQuestions;
let currentQuestion = 0;
let randomSeed = "";
let numberOfOptions = 6;

document.getElementById("windowLocation").innerHTML = window.location.toString();
// document.getElementById("questionText").style.maxHeight = Math.round(window.innerHeight*0.8)+"px";

//open modal
$("#mymodal").modal()



// generate or load random seed from localStorage
if (localStorage.getItem("randomseed") === null) {
  randomSeed = getRandomSeed();
  localStorage.setItem("currentquestion", currentQuestion);
} else {
  randomSeed = localStorage.getItem("randomseed");
  currentQuestion = JSON.parse(localStorage.getItem("currentquestion"));
}

// jquery load the json into questions array
$.getJSON("gbif.json", function(json) {
  questions = shuffle(json, randomSeed);
  unfilteredQuestions = copyArray(questions);
  filterImages();
  //if (document.location.href == "https://birdgame1--justinriley1.repl.co/") {
    loadQuestion(randomSeed+currentQuestion);
    //console.log(document.location);
  // }
  // else {
    // this code is now in game2script.js
  //   loadQuestion2(randomSeed+currentQuestion);
  // }  
  
})
.fail(function() { console.log("json error"); })


// display 1 question on screen
function loadQuestion(myseed) {
  document.getElementById("questionText").innerHTML = "<img src='"+
    choice(questions[currentQuestion % questions.length]["Images"],myseed) +
    "'>";
  loadAnswers();
}

// this code is now in game2script.js
// function loadQuestion2(myseed) {
//   //document.getElementById("questionText1").innerHTML = "<img src='"+
//     choice(questions[currentQuestion % questions.length]["Images"],myseed) +
//     "'>";
//   //document.getElementById("questionText2").innerHTML = "<img src='"+
//   choice(questions[currentQuestion % questions.length]["Images"],myseed) +
//   "'>";
//   loadAnswers();
// }


// get correct and random answers
function loadAnswers() {
  Math.seedrandom(randomSeed);
  var answers = [questions[currentQuestion % questions.length]["CommonName"]];
  // check in case we filtered
  if(questions.length < numberOfOptions){
    numberOfOptions = questions.length;
  }
  while (answers.length < numberOfOptions) {
    var flag = false;
    Math.seedrandom("" + new Date().getMilliseconds());
    var newAnswer =
      questions[Math.floor(Math.random() * questions.length)]["CommonName"];
    for (var i = 0; i < answers.length; i++) {
      // keep searching if the new answer is same as any of the previous answers
      if (answers[i].toLowerCase() == newAnswer.toLowerCase()) {
        flag = true;
        break;
      }
    }
    // if not a previous answer, add to answers array
    if (!flag) {
      answers.push(newAnswer);
    }
  }
  var answers2 = answers.slice(0);
  answers2 = shuffle(answers2, "" + new Date().getMilliseconds());
  updateOptions(answers2);
}


// take the answers array and fill dropdown
function updateOptions(answers) {
  var optArray = document.getElementsByClassName("opt");
  // clear old options
  for (var i = 0; i < optArray.length; i++) {
    optArray[i].value = "";
    optArray[i].innerHTML = "";
  }
  for (var i = 0; i < answers.length; i++) {
    optArray[i].value = answers[i];
    optArray[i].innerHTML = answers[i];
  }
  document.getElementById("pick").selected = true;
}

// compare selected with actual answer
function checkAnswer(value) {
  if (
    value.toLowerCase() ==
    questions[currentQuestion % questions.length]["CommonName"].toLowerCase()
  ) {
    document.activeElement.blur();
    document.body.style.backgroundColor = "#00ff00";
    setTimeout(() => {
      document.body.style.backgroundColor = "#343a40";
    }, 200);
    currentQuestion++;
    localStorage.setItem("currentquestion", currentQuestion);
    setTimeout(() => {
      loadQuestion(randomSeed+currentQuestion);
      
  }, 300);
  } else {
    document.body.style.backgroundColor = "#ff0000";
    setTimeout(() => {
      document.body.style.backgroundColor = "#343a40";
    }, 200);
  }
}

// generate a long random seed number
function getRandomSeed() {
  var r = "" + new Date().getMilliseconds();
  localStorage.setItem("randomseed", r);
  Math.seedrandom(r);
  return r;
}

// Fisher–Yates shuffle using a random seed
function shuffle(array, myseed) {
  var temporaryValue,
    randomIndex;
  Math.seedrandom(myseed);
  for(var i=0;i<array.length;i++){
    // pick a remaining element
    randomIndex = Math.floor(Math.random() * array.length);
    // and swap it with the current element
    temporaryValue = array[i];
    array[i] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}

// get random element from array
function choice(array,myseed){
  Math.seedrandom(myseed);
  var choice = array[Math.floor(Math.random() * array.length)];
  return choice;
}

// are these arrays equal?
function compareArrays(a, b) {
  if (JSON.stringify(a) == JSON.stringify(b)) return true;
  else return false;
}

// returns a new, disconnected array
function copyArray(arr){
  return JSON.parse(JSON.stringify(arr));
}

// place all filters at the bottom

// only show questions with images
function filterImages(){
  questions = questions.filter(function(each){
          return each["Images"].length > 0;
  });
  loadQuestion(randomSeed+currentQuestion);
}

function filterTop(num){
  $('#mymodal').modal('hide');
  questions = unfilteredQuestions.filter(function(each){
          return each["OhioRank"] <= num;
  });
  filterImages()
  loadQuestion(randomSeed+currentQuestion);
}

function filterSpecies(species){
  $('#mymodal').modal('hide');
  questions = unfilteredQuestions.filter(function(each){
          return each["Tags"].includes("woodpecker");
  });
  filterImages()
  loadQuestion(randomSeed+currentQuestion);
}

function filterWoodpecker(){
  questions = unfilteredQuestions.filter(function(each){
          return each["Tags"].includes("woodpecker");
  });
  filterImages()
  loadQuestion(randomSeed+currentQuestion);
}

function filterRaptor(){
  questions = unfilteredQuestions.filter(function(each){
          return each["Tags"].includes("raptor");
  });
  filterImages()
  loadQuestion(randomSeed+currentQuestion);
}

function filterWingspan(lowernum, highernum){
  questions = unfilteredQuestions.filter(function(each){
          return each["WingspanCentimeters"] < highernum && each["WingspanCentimeters"] >= lowernum;
  });
  filterImages()
  loadQuestion(randomSeed+currentQuestion);
}

function debugImages(){
  filterImages()
  for(let each of questions){
    for(let pic of each["Images"]){
      document.body.innerHTML += `<img src="${pic}" width="200px" height="200px" onerror="alert('OOF! broken image ${pic}')">`;
    }
  }
}

