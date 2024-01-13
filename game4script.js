// version 2020.09.05

let questions;
let unfilteredQuestions;
let currentQuestion = 0;
let randomSeed = "";
let numberOfOptions = 6;
let questionAudio = new Audio();
let daysSinceEpoch = 0;
let sixteenQuestions = [];
let fourKeys = [];
let fourByContainer = document.getElementById("four-by-four-grid-container");
fourByContainer.classList.add("animated");

document.getElementById('datepicker').max = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split("T")[0];

Date.prototype.toDateInputValue = (function() {
  var local = new Date(this);
  local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
  return local.toJSON().slice(0, 10);
});

document.getElementById('datepicker').value = new Date().toDateInputValue();

document.getElementById("windowLocation").innerHTML = window.location.toString();
// document.getElementById("questionText").style.maxHeight = Math.round(window.innerHeight*0.8)+"px";

//open modal
//$("#mymodal").modal()



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
    questions = shuffle(json, daysSinceEpoch);;
    unfilteredQuestions = copyArray(questions);
    loadGame();
  })
  .fail(function() {
    console.log("json error");
  })


function setPuzzleDate() {
  if (Math.floor((new Date() - new Date().getTimezoneOffset()) / (60 * 60 * 24 * 1000)) <= Math.ceil((datepicker.valueAsDate) / (60 * 60 * 24 * 1000))) {
    document.getElementById('datepicker').value = new Date().toDateInputValue();
    return;
  }
  fourByContainer.innerHTML = '';
  loadGame();
}

function loadGame() {
  let datepicker = document.getElementById("datepicker");
  daysSinceEpoch = Math.floor((datepicker.valueAsDate - new Date().getTimezoneOffset()) / (60 * 60 * 24 * 1000));
  sixteenQuestions = [];
  sixteenQuestions.length = 0;
  fourKeys = [];
  fourKeys = generateKeys(sixteenQuestions);
  sixteenQuestions = shuffle(sixteenQuestions, daysSinceEpoch);

  fourByContainer.innerHTML = '';
  for (let i = 0; i < sixteenQuestions.length; i++) {
    const btn = document.createElement("button");
    btn.innerHTML = sixteenQuestions[i].CommonName;
    btn.value = sixteenQuestions[i].CommonName;
    btn.classList.add("btn");
    btn.classList.add("btn-primary");
    btn.classList.add("btn-sm");
    //btn.classList.add("m-2");
    btn.classList.add("gameButton");
    fourByContainer.appendChild(btn);
    btn.addEventListener("click", toggleButton);
  }
}

function toggleButton() {
  let selectedButtons = document.getElementsByClassName("btn-danger");
  if (selectedButtons.length == 4) {
    return;
  }
  if (this.classList.contains("btn-primary")) {
    this.classList.remove("btn-primary");
    this.classList.add("btn-danger");
  } else if (this.classList.contains("btn-danger")) {
    this.classList.remove("btn-danger");
    this.classList.add("btn-primary");
  }
  // check if there are 4 selected buttons

  if (selectedButtons.length == 4) {
    // check if the selected buttons matches the keys

    let myKey = doesSelectedMatchAKey(selectedButtons)
    if (myKey <= 3) {
      //incorrect
      fourByContainer.classList.add('xshake');
      fourByContainer.style.animationPlayState = "running";
      setTimeout(function() {
        //alert(myKey+" out of 4");
        $('#mymodal').modal('show');
        $("#mymodal .modal-body .text-center").text(myKey + " out of 4");
        deselectAllButtons();
        fourByContainer.style.animationPlayState = "paused";
        fourByContainer.classList.remove("xshake");
      }, 1000)
    } else {
      //correct
      fourByContainer.classList.add('bounce');
      fourByContainer.style.animationPlayState = "running";
      setTimeout(function() {
        //alert(toTitleCase(myKey.name));
        $('#mymodal').modal('show');
        $("#mymodal .modal-body .text-center").text(myKey.name);
        disableSelectedButtons(myKey.color);
        fourByContainer.style.animationPlayState = "paused";
        fourByContainer.classList.remove("bounce");
      }, 1000)
    }


  }
}

function previousDay() {
  //get the date from the datepicker
  var d = datepicker.valueAsDate;

  //subtract 1 day from the date object
  d.setDate(d.getDate());
  console.log(d);
  document.getElementById('datepicker').value = d.toDateInputValue();
  loadGame()
}

function toTitleCase(str) {
  return str.replace(
    /\w\S*/g,
    function(txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    }
  );
}

function disableSelectedButtons(color) {
  let mylist = document.getElementsByClassName("gameButton");
  for (let i = 0; i < mylist.length; i++) {
    if (mylist[i].classList.contains("btn-danger")) {
      mylist[i].classList.remove("btn-danger");
      //mylist[i].classList.add("btn-success");
      mylist[i].style.background = color;
      mylist[i].disabled = true;
    }
  }
}

function deselectAllButtons() {
  let mylist = document.getElementsByClassName("gameButton");
  for (let i = 0; i < mylist.length; i++) {
    if (mylist[i].classList.contains("btn-danger")) {
      mylist[i].classList.remove("btn-danger");
      mylist[i].classList.add("btn-primary");
    }
  }
}

function doesSelectedMatchAKey(selectedButtons) {
  let highestCount = 0;
  for (let i = 0; i < fourKeys.length; i++) {
    let count = 0;
    let currentKey = fourKeys[i];
    for (let j = 0; j < currentKey.questions.length; j++) {
      for (let k = 0; k < selectedButtons.length; k++) {
        if (currentKey.questions[j].CommonName == selectedButtons[k].value) {
          count++;
          if (count == 4) {
            return currentKey;
          }
        }
      }
      if (count > highestCount) {
        highestCount = count;
      }
    }
  }
  return highestCount;
}



function playPressed() {
  questionAudio.play();
  document.getElementById("playButton").classList.add('animation-pulse');
  document.getElementById("playButton").style.animationPlayState = "running";
  // detect when audio stops
  questionAudio.addEventListener('ended', function() {
    this.currentTime = 0;
    document.getElementById("playButton").style.animationPlayState = "paused";
  }, false);
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
  for (var i = 0; i < array.length; i++) {
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
function choice(array, myseed) {
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
function copyArray(arr) {
  return JSON.parse(JSON.stringify(arr));
}

function getIndexOfKey(searchName, mylist) {
  for (let i = 0; i < mylist.length; i++) {
    if (mylist[i].name == searchName) {
      return i;
    }
  }
  return -1;
}

function getListOfKeys() {
  let keylist = [];
  //tiny wingspan
  let smallList = filterWingspan(0, 18);
  keylist.push({
    name: "Tiny Wingspan",
    count: smallList.length,
    questions: smallList
  });
  let hugeList = filterWingspan(145, 999);
  keylist.push({
    name: "Huge Wingspan",
    count: hugeList.length,
    questions: hugeList
  });
  //add tags
  for (each of unfilteredQuestions) {
    for (eachTag of each["Tags"]) {
      eachTag = toTitleCase(eachTag);
      let index = getIndexOfKey(eachTag, keylist);
      if (index == -1) {
        keylist.push({
          name: eachTag,
          count: 1,
          questions: [each]
        });
      } else {
        keylist[index].count++;
        keylist[index].questions.push(each);
      }
    }
  }
  //add order
  for (each of unfilteredQuestions) {
    let index = getIndexOfKey("Order " + each.Order, keylist);
    if (index == -1) {
      keylist.push({
        name: "Order " + each.Order,
        count: 1,
        questions: [each]
      });
    } else {
      keylist[index].count++;
      keylist[index].questions.push(each);
    }
  }
  //add families
  for (each of unfilteredQuestions) {
    let index = getIndexOfKey("Family " + each.Family, keylist);
    if (index == -1) {
      keylist.push({
        name: "Family " + each.Family,
        count: 1,
        questions: [each]
      });
    } else {
      keylist[index].count++;
      keylist[index].questions.push(each);
    }
  }
  //add genus
  for (each of unfilteredQuestions) {
    let index = getIndexOfKey("Genus " + each.Genus, keylist);
    if (index == -1) {
      keylist.push({
        name: "Genus " + each.Genus,
        count: 1,
        questions: [each]
      });
    } else {
      keylist[index].count++;
      keylist[index].questions.push(each);
    }
  }
  //add starts with
  for (each of unfilteredQuestions) {
    let index = getIndexOfKey("Starts With " + each.CommonName[0], keylist);
    if (index == -1) {
      keylist.push({
        name: "Starts With " + each.CommonName[0],
        count: 1,
        questions: [each]
      });
    } else {
      keylist[index].count++;
      keylist[index].questions.push(each);
    }
  }
  return keylist;
}



function getFourQuestionsFromKey(key, sixteenQuestions) {
  // get four random questions from the key
  let fourQuestions = [];
  let keyQuestions = copyArray(key.questions);
  keyQuestions = shuffle(key.questions, daysSinceEpoch);
  for (let i = 0; i < key.questions.length; i++) {
    let tempQuestion = keyQuestions[i];

    //if question is not already in the list, add it
    if (!sixteenQuestions.includes(tempQuestion)) {
      fourQuestions.push(tempQuestion);
      if (fourQuestions.length >= 4) {
        //add all four to sixteenQuesions
        for (let i = 0; i < fourQuestions.length; i++) {
          sixteenQuestions.push(fourQuestions[i]);
        }
        return fourQuestions;
      }
    }
  }
  return [];
}

function generateKeys(sixteenQuestions) {
  let keylist = getListOfKeys();
  keylist = keylist.filter((key) => key.count >= 4);
  keylist = shuffle(keylist, daysSinceEpoch);
  //return keylist
  // select four keys
  let keys = [];
  let keycolors = ["#999900", "#009900", "#994400", "#990099"]
  for (let i = 0; i < keylist.length; i++) {
    let fourQuestions = getFourQuestionsFromKey(keylist[i], sixteenQuestions);
    if (fourQuestions.length == 4) {
      keys.push(keylist[i]);
      keys[keys.length - 1].questions = fourQuestions;
      keys[keys.length - 1].color = keycolors[keys.length - 1];
      if (keys.length >= 4) {
        return keys;
      }
    }
  }
  return -1;
}

// place all filters at the bottom

// only show questions with sounds
function filterSounds() {
  questions = questions.filter(function(each) {
    return each["Audio"].length > 0;
  });
  loadQuestion(randomSeed + currentQuestion);
}

function filterTop(num) {
  $('#mymodal').modal('hide');
  questions = unfilteredQuestions.filter(function(each) {
    return each["OhioRank"] <= num;
  });
  filterSounds()
  loadQuestion(randomSeed + currentQuestion);
}

function filterSpecies(species) {
  $('#mymodal').modal('hide');
  questions = unfilteredQuestions.filter(function(each) {
    return each["Tags"].includes(species);
  });
  filterSounds()
  loadQuestion(randomSeed + currentQuestion);
}

function filterWoodpecker() {
  questions = unfilteredQuestions.filter(function(each) {
    return each["Tags"].includes("woodpecker");
  });
  filterSounds()
  loadQuestion(randomSeed + currentQuestion);
}

function filterRaptor() {
  questions = unfilteredQuestions.filter(function(each) {
    return each["Tags"].includes("raptor");
  });
  filterSounds()
  loadQuestion(randomSeed + currentQuestion);
}

function filterWingspan(lowernum, highernum) {
  questions = unfilteredQuestions.filter(function(each) {
    return each["WingspanCentimeters"] < highernum && each["WingspanCentimeters"] >= lowernum;
  });
  //filterSounds()
  //loadQuestion(randomSeed+currentQuestion);
  return questions;
}

function debugImages() {
  filterImages()
  for (let each of questions) {
    for (let pic of each["Images"]) {
      document.body.innerHTML += `<img src="${pic}" width="200px" height="200px" onerror="alert('OOF! broken image ${pic}')">`;
    }
  }
}