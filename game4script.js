// version v2024.01.19
let version = "v2024.01.19";
let questions;
let unfilteredQuestions;
let currentQuestion = 0;
let randomSeed = "";
let numberOfOptions = 6;
let questionAudio = new Audio();
let daysSinceEpoch = 0;
let sixteenQuestions = [];
let fourLocks = [];
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

// generate or load random seed from localStorage
// if (localStorage.getItem("randomseed") === null) {
//   randomSeed = getRandomSeed();
//   localStorage.setItem("currentquestion", currentQuestion);
// } else {
//   randomSeed = localStorage.getItem("randomseed");
//   currentQuestion = JSON.parse(localStorage.getItem("currentquestion"));
// }

// jquery load the json into questions array
$.getJSON("gbif.json", function(json) {
    questions = shuffle(json, daysSinceEpoch);;
    unfilteredQuestions = copyArray(questions);
    loadGame();
  })
  .fail(function() {
    console.log("json error");
  })


// when a modal is dimissed check if game is complete
$(document).ready(function() {
  $("#mymodal").on('hidden.bs.modal', function() {
    if (isGameComplete()) {
      setTimeout(
        function() {
          showCompleteScreen();
          //let finishedText = "COMPLETE!";
          // $('#mymodal').modal('show');
          // $("#modal-h2").text(finishedText);
          // $("#modal-p").text(finishedNameList.join(", "));

        }, 100
      );
    }
  });
});

function getDatePickerAsString() {
  //get date from datepicker
  let curr_year = document.getElementById('datepicker').value.split("-")[0];
  let curr_month = document.getElementById('datepicker').value.split("-")[1];
  let curr_date = document.getElementById('datepicker').value.split("-")[2];
  return curr_month + "/" + curr_date + "/" + curr_year;
}

function showCompleteScreen() {
  localStorage.setItem(version + getDatePickerAsString(), true);
  let finishedNameList = [];
  for (let i = 0; i < fourLocks.length; i++) {
    finishedNameList.push(fourLocks[i].name);
  }
  fourByContainer.innerHTML = "";
  fourByContainer.style.gridTemplateColumns = "auto";
  const h2node = document.createElement("h2");
  //get date from datepicker
  // var d = new Date(document.getElementById('datepicker').valueAsDate);
  // var curr_date = d.getDate()+1;
  // var curr_month = d.getMonth() + 1; //Months are zero based
  // var curr_year = d.getFullYear();
  const h2textnode = document.createTextNode(getDatePickerAsString() + " COMPLETE!");
  h2node.appendChild(h2textnode);
  h2node.classList.add("text-center");
  fourByContainer.appendChild(h2node);
  // small text list of locks
  const pnode = document.createElement("small");
  const ptextnode = document.createTextNode(finishedNameList.join(", "));
  pnode.appendChild(ptextnode);
  pnode.classList.add("text-center");
  pnode.classList.add("text-body");
  pnode.classList.add("tiny");
  fourByContainer.appendChild(pnode);
  // replay this day button
  const replaybtn = document.createElement("button");
  replaybtn.innerHTML = "&olarr; Replay Puzzle";
  replaybtn.classList.add("btn");
  replaybtn.classList.add("btn-outline-danger");
  replaybtn.classList.add("btn-lg");
  replaybtn.classList.add("gameButton");
  replaybtn.classList.add("w-50");
  replaybtn.classList.add("mx-auto");
  replaybtn.classList.add("my-2");
  fourByContainer.appendChild(replaybtn);
  replaybtn.addEventListener("click", replayPuzzle);
  // random day button
  const randbtn = document.createElement("button");
  randbtn.innerHTML = "&#10538; Random Puzzle";
  randbtn.classList.add("btn");
  randbtn.classList.add("btn-outline-success");
  randbtn.classList.add("btn-lg");
  randbtn.classList.add("gameButton");
  randbtn.classList.add("w-50");
  randbtn.classList.add("mx-auto");
  randbtn.classList.add("my-2");
  fourByContainer.appendChild(randbtn);
  randbtn.addEventListener("click", setPuzzleDateRandom);
  // previous day button
  const previousbtn = document.createElement("button");
  previousbtn.innerHTML = "&Ll; Previous Puzzle";
  previousbtn.id = "previousDayBtn";
  previousbtn.classList.add("btn");
  previousbtn.classList.add("btn-outline-warning");
  previousbtn.classList.add("btn-lg");
  previousbtn.classList.add("gameButton");
  previousbtn.classList.add("w-50");
  previousbtn.classList.add("mx-auto");
  previousbtn.classList.add("my-2");
  fourByContainer.appendChild(previousbtn);
  previousbtn.addEventListener("click", previousDay);
  // final string display
  // const pnode2 = document.createElement("small");
  // const ptextnode2 = document.createTextNode("Click below to copy/share on social media");
  // pnode2.appendChild(ptextnode2);
  // pnode2.classList.add("text-center");
  // pnode2.classList.add("text-body");
  // pnode2.classList.add("tiny");
  // fourByContainer.appendChild(pnode2);

  const card = document.createElement("div");
  card.classList.add("btn");
  card.classList.add("btn-outline-primary");
  card.classList.add("w-50");
  card.classList.add("mx-auto");
  card.classList.add("my-2");
  card.classList.add("fontsize1rem");
  card.classList.add("text-primary");
  card.innerHTML = "Copy/share on social media"
  // const cardbody = document.createElement("div");
  // cardbody.classList.add("card-body");
  // const cardtextnode = document.createTextNode("Copy & share on social media");
  // cardbody.appendChild(cardtextnode);
  const cardpre = document.createElement("pre");
  cardpre.innerHTML = localStorage.getItem(version + getDatePickerAsString() + "String");
  cardpre.setAttribute("id", "cardpre");
  cardpre.classList.add("text-body");
  //cardbody.appendChild(cardpre);
  //card.appendChild(cardbody);
  card.appendChild(cardpre);
  card.addEventListener("click", copyText);
  fourByContainer.appendChild(card);

}

function copyText() {

  // get the container
  const element = document.querySelector('#cardpre');
  // Create a fake `textarea` and set the contents to the text
  // you want to copy
  const storage = document.createElement('textarea');
  storage.value = element.innerHTML;
  storage.value += "https://bit.ly/birdconnections";
  element.appendChild(storage);

  // Copy the text in the fake `textarea` and remove the `textarea`
  storage.select();
  storage.setSelectionRange(0, 99999);
  navigator.clipboard.writeText(storage.value);
  element.removeChild(storage);
  $('#mymodal').modal('show');
  $("#modal-h2").text("Copied to clipboard");
  $("#modal-p").text("");
}

function isGameComplete() {
  for (let i = 0; i < fourLocks.length; i++) {
    if (fourLocks[i].isLocked) {
      return false;
    }
  }
  return true;
}

function replayPuzzle() {
  localStorage.setItem(version + getDatePickerAsString(), false);
  localStorage.setItem(version + getDatePickerAsString() + "String", "#BirdConnections\nPuzzle " + getDatePickerAsString() + "\n");
  // console.log(getDatePickerAsString());
  // console.log(localStorage.getItem(getDatePickerAsString()));
  // console.log(localStorage);
  setTimeout(loadGame, 100);
}

function setPuzzleDate() {
  if (Math.floor((new Date() - new Date().getTimezoneOffset()) / (60 * 60 * 24 * 1000)) <= Math.ceil((datepicker.valueAsDate) / (60 * 60 * 24 * 1000))) {
    document.getElementById('datepicker').value = new Date().toDateInputValue();
    return;
  }
  fourByContainer.innerHTML = '';
  loadGame();
}

function setPuzzleDateRandom() {
  document.getElementById('datepicker').value = new Date(Math.random() * (new Date().getTime() - new Date().getTimezoneOffset() * 60000)).toDateInputValue();
  loadGame();
}

function loadGame() {
  let datepicker = document.getElementById("datepicker");
  daysSinceEpoch = Math.floor((datepicker.valueAsDate - new Date().getTimezoneOffset()) / (60 * 60 * 24 * 1000));
  sixteenQuestions = [];
  sixteenQuestions.length = 0;
  fourLocks = [];
  fourLocks = generateLocks(sixteenQuestions);
  sixteenQuestions = shuffle(sixteenQuestions, daysSinceEpoch);

  fourByContainer.innerHTML = '';
  fourByContainer.style.gridTemplateColumns = "auto auto auto auto";
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
  if (localStorage.getItem(version + getDatePickerAsString()) === "true") {
    showCompleteScreen();
  } else {
    localStorage.setItem(version + getDatePickerAsString() + "String", "#BirdConnections\nPuzzle " + getDatePickerAsString() + "\n");
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
    // check if the selected buttons matches the locks

    let myLock = doesSelectedMatchALock(selectedButtons)
    if (myLock <= 3) {
      //incorrect
      fourByContainer.classList.add('xshake');
      fourByContainer.style.animationPlayState = "running";
      setTimeout(function() {
        //alert(myLock+" out of 4");
        $('#mymodal').modal('show');
        $("#modal-h2").text(myLock + " out of 4");
        $("#modal-p").text("");
        deselectAllButtons();
        fourByContainer.style.animationPlayState = "paused";
        fourByContainer.classList.remove("xshake");
      }, 1000)
    } else {
      //correct
      fourByContainer.classList.add('bounce');
      fourByContainer.style.animationPlayState = "running";
      setTimeout(function() {
        //alert(toTitleCase(myLock.name));
        $('#mymodal').modal('show');
        $("#modal-h2").text(myLock.name);
        $("#modal-p").text("");
        disableSelectedButtons(myLock.color);
        fourByContainer.style.animationPlayState = "paused";
        fourByContainer.classList.remove("bounce");
        myLock.isLocked = false;
      }, 1000)
    }


  }
}

function previousDay() {
  //get the date from the datepicker
  var d = datepicker.valueAsDate;

  //subtract 1 day from the date object
  d.setDate(d.getDate());
  //console.log(d);
  document.getElementById('datepicker').value = d.toDateInputValue();
  loadGame()
  document.getElementById("previousDayBtn").blur();
  setTimeout(function() {
    document.activeElement.blur()
  }, 100);

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

function doesSelectedMatchALock(selectedButtons) {
  let highestCount = 0;
  for (let i = 0; i < fourLocks.length; i++) {
    let count = 0;
    let currentLock = fourLocks[i];
    for (let j = 0; j < currentLock.questions.length; j++) {
      for (let k = 0; k < selectedButtons.length; k++) {
        if (currentLock.questions[j].CommonName == selectedButtons[k].value) {
          count++;
          addCharToFinalString(currentLock.questions[j].emoji);
          if (count == 4) {
            addCharToFinalString("\n");
            return currentLock;
          }
        }
      }
      if (count > highestCount) {
        highestCount = count;
      }
    }
  }
  addCharToFinalString("\n");
  return highestCount;
}

function addCharToFinalString(char) {
  const old = localStorage.getItem(version + getDatePickerAsString() + "String");
  if (old === null) {
    localStorage.setItem(version + getDatePickerAsString() + "String", "#BirdConnections\nPuzzle " + getDatePickerAsString() + "\n" + char);
  } else {
    localStorage.setItem(version + getDatePickerAsString() + "String", old + char);
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

function getIndexOfLock(searchName, mylist) {
  for (let i = 0; i < mylist.length; i++) {
    if (mylist[i].name == searchName) {
      return i;
    }
  }
  return -1;
}

function getListOfLocks() {
  let locklist = [];
  //tiny wingspan
  let smallList = filterWingspan(0, 18);
  locklist.push({
    name: "Tiny Wingspan",
    count: smallList.length,
    questions: smallList
  });
  let hugeList = filterWingspan(145, 999);
  locklist.push({
    name: "Huge Wingspan",
    count: hugeList.length,
    questions: hugeList
  });
  //add tags
  for (each of unfilteredQuestions) {
    for (eachTag of each["Tags"]) {
      eachTag = toTitleCase(eachTag);
      let index = getIndexOfLock(eachTag, locklist);
      if (index == -1) {
        locklist.push({
          name: eachTag,
          count: 1,
          questions: [each]
        });
      } else {
        locklist[index].count++;
        locklist[index].questions.push(each);
      }
    }
  }
  //add order
  for (each of unfilteredQuestions) {
    let index = getIndexOfLock("Order " + each.Order, locklist);
    if (index == -1) {
      locklist.push({
        name: "Order " + each.Order,
        count: 1,
        questions: [each]
      });
    } else {
      locklist[index].count++;
      locklist[index].questions.push(each);
    }
  }
  //add families
  for (each of unfilteredQuestions) {
    let index = getIndexOfLock("Family " + each.Family, locklist);
    if (index == -1) {
      locklist.push({
        name: "Family " + each.Family,
        count: 1,
        questions: [each]
      });
    } else {
      locklist[index].count++;
      locklist[index].questions.push(each);
    }
  }
  //add genus
  for (each of unfilteredQuestions) {
    let index = getIndexOfLock("Genus " + each.Genus, locklist);
    if (index == -1) {
      locklist.push({
        name: "Genus " + each.Genus,
        count: 1,
        questions: [each]
      });
    } else {
      locklist[index].count++;
      locklist[index].questions.push(each);
    }
  }
  //add starts with
  for (each of unfilteredQuestions) {
    let index = getIndexOfLock("Starts With " + each.CommonName[0], locklist);
    if (index == -1) {
      locklist.push({
        name: "Starts With " + each.CommonName[0],
        count: 1,
        questions: [each]
      });
    } else {
      locklist[index].count++;
      locklist[index].questions.push(each);
    }
  }
  return locklist;
}



function getFourQuestionsFromLock(lock, sixteenQuestions) {
  // get four random questions from the lock
  let fourQuestions = [];
  let lockQuestions = copyArray(lock.questions);
  lockQuestions = shuffle(lock.questions, daysSinceEpoch);
  for (let i = 0; i < lock.questions.length; i++) {
    let tempQuestion = lockQuestions[i];

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

function generateLocks(sixteenQuestions) {
  let locklist = getListOfLocks();
  locklist = locklist.filter((lock) => lock.count >= 4);
  locklist = shuffle(locklist, daysSinceEpoch);
  //return locklist
  // select four locks
  let locks = [];
  let lockEmojis = ["🐥", "🦚", "🦉", "🐦"]
  let lockcolors = ["#999900", "#009900", "#994400", "#990099"]
  for (let i = 0; i < locklist.length; i++) {
    let fourQuestions = getFourQuestionsFromLock(locklist[i], sixteenQuestions);
    if (fourQuestions.length == 4) {
      locks.push(locklist[i]);
      // add emojis to each question
      for (let j = 0; j < 4; j++) {
        fourQuestions[j].emoji = lockEmojis[locks.length - 1];
      }
      locks[locks.length - 1].questions = fourQuestions;
      locks[locks.length - 1].color = lockcolors[locks.length - 1];
      locks[locks.length - 1].isLocked = true;
      if (locks.length >= 4) {
        return locks;
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