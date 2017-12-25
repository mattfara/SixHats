$(document).ready(function(){
  $('#functionality').prop("sequenceOption", true);
  }
);

//check state of the forms, sequence textbox
$('#btn-for-starting-fixed-sequence').on("click", function() {
  if (areFormsValid()) {
    removeRedBorderFromDiv();
    if (isSequenceTextboxEmpty()) {
      postMessageToUser("Sequence empty");
      giveDivRedBorder('#fixed-sequence-instructions');
    } else {
      removeRedBorderFromDiv();
      prepareButtonsAndAttributesForStart(); //not sure about this one
      var sequence, seconds, hat;

      if (isCounterPaused()) {
        hat = getCurrentHatColor();
        seconds = getTotalSecondsFromCounter() - 1;
        unpause();
      } else {
        sequence = getSequenceFromTextboxVal();
        console.log("BTN: The sequence from textbox: " + sequence);
        sequence = standardizeSequenceAndParseToArray(sequence);
        console.log("BTN: The sequence after processing: " + sequence);
        hat = sequence.shift();
        console.log("BTN: Hat after shift: " + hat);
        saveSequenceAttrOnSequenceTextbox(sequence);
        seconds = isFixedIntervalChecked() ? getTotalSecondsFromFixedIntervalForm() : generateRandomTimeFromMinuteRange()
      }

      clearMessageToUser();
      makeSequenceTextboxReadOnly();
      displayHatAndPassTimeToCountdown(hat, seconds);
    }
  }
});


function countdownForFixedSequence(seconds) {

  var count = seconds + 1;

  var interval = setInterval(function() {
    var shouldSkip = doesSkipBtnHaveAttr();

    if (isCounterPaused()) {
      clearInterval(interval);
    } else if (wasStopBtnClicked()) {
      clearInterval(interval);
      removeStoppedAttr();
    } else {
      count--;

      if (!shouldSkip)
        calculateCounterValuesAndDisplay(count);

      if (count === 0 || shouldSkip) {
        clearInterval(interval);
        var sequence = getSequenceAttrFromSequenceTextbox(); //maybe try passing the first member of array here
        console.log("The sequence inside of counting: " + sequence);
        sequence = standardizeSequenceAndParseToArray(sequence);
        console.log("Inside of counting, The sequence after processing: " + sequence);

        var seconds = isFixedIntervalChecked() ? getTotalSecondsFromFixedIntervalForm() : generateRandomTimeFromMinuteRange()
        turnOffSkip();
        if (isSequenceAttrEmpty()) {
          reset();
          postMessageToUser("Sequence complete");
          dingEndBell();
        } else {
          var hat = sequence.shift();
          console.log("Inside counting, The hat: " + hat);
          saveSequenceAttrOnSequenceTextbox(sequence);
          displayHatAndPassTimeToCountdown(hat, seconds);
        }
      }
    }
  }, 1000);
}

$('#btn-for-starting-random-sequence').on("click", function() {
  if (areFormsValid()) {
    removeRedBorderFromDiv();
    prepareButtonsAndAttributesForStart();

    var hatNumber, hat, seconds;

    if (isCounterPaused()) {
      hat = getCurrentHatColor();
      seconds = getTotalSecondsFromCounter() - 1;
      unpause();
    } else {
      hatNumber = randomlySelectNumberForHat();
      hat = getHatByNumber(hatNumber);
      seconds = isFixedIntervalChecked() ? getTotalSecondsFromFixedIntervalForm() : generateRandomTimeFromMinuteRange()
    }

    clearMessageToUser();
    $(this).prop('disabled', true);
    displayHatAndPassTimeToCountdown(hat, seconds);
  }
});

function countdownForRandomSequence(seconds) {
  var count = seconds + 1;

  var interval = setInterval(function() {
    var shouldSkip = doesSkipBtnHaveAttr();

    if (isCounterPaused()) {
      clearInterval(interval);
    } else if (wasStopBtnClicked()) {
      clearInterval(interval);
      removeStoppedAttr();
    } else {
      count--;
      if (!shouldSkip)
        calculateCounterValuesAndDisplay(count);

      if (count === 0 || shouldSkip) {
        clearInterval(interval);

        var hatNumber, hat, seconds;
        hatNumber = randomlySelectNumberForHat();
        hat = getHatByNumber(hatNumber);

        seconds = isFixedIntervalChecked() ? getTotalSecondsFromFixedIntervalForm() : generateRandomTimeFromMinuteRange()
        turnOffSkip();
        clearMessageToUser();
        displayHatAndPassTimeToCountdown(hat, seconds);
      }
    }
  }, 1000);
}

function displayHatAndPassTimeToCountdown(hat, seconds) {
  setHatColorOnPage(hat);
  setHatMonikerOnPage(hat);
  dingStartBell();
  isUsingFixedSequence() ? countdownForFixedSequence(seconds) : countdownForRandomSequence(seconds)
}

function getCurrentHatColor(){
  return $('#hat').css("background-color");
}

function calculateCounterValuesAndDisplay(count){
  var h, m, s;

  h = Math.floor((count % (60 * 60 * 24)) / (60 * 60));
  m = Math.floor((count % (60 * 60)) / (60));
  s = Math.floor(count % 60);

  $('#counter').text(h + "h " + m + "m " + s + "s ");
}

function isUsingFixedSequence(){
  return $('#functionality').prop("sequenceOption") == true;
}


//might conisder adding the sequence textbox checker here, changing name first
//to be consistent
function areFormsValid() {
  return isFixedIntervalFormValid() & isRandomIntervalFormValid()
}

//rename to isSequenceFormValid
//switch retur statement to > 0
//fix elsewhere as opposite
//make sure everything still works
// add this method to above
// make sure still works
function isSequenceTextboxEmpty() {
  var content = $('#sequence').val();
  jQuery.trim(content);
  return content.length === 0;
}

function isFixedIntervalFormValid() {
  var hoursEmpty = $('#hours').val() === "";
  var minutesEmpty = $('#minutes').val() === "";
  var secondsEmpty = $('#seconds').val() === "";

  if (hoursEmpty || minutesEmpty || secondsEmpty) {
    $('#message').val('Fill all fields');
    giveDivRedBorder('#fixed-time');
    return false;
  }
  return true;
}

function isRandomIntervalFormValid() {
  var lowerLimit = $('#lower-random-interval-limit').val();
  var upperLimit = $('#upper-random-interval-limit').val();

  if (lowerLimit === "" || upperLimit === "") {
    $('#message').val('Fill all fields');
    giveDivRedBorder('#random-time');
    return false;
  }

  if (lowerLimit >= upperLimit) {
    $('#message').val('Lower < Upper!');
    giveDivRedBorder('#random-time');
    return false;
  }
  return true;
}

function removeRedBorderFromDiv(){
  $('.canHaveErrors').css('border', 0);
}

function giveDivRedBorder(divId){
  $(divId).css('border', '2px solid red');
}

$('#fixed-time').on("click", function() {
  $('#fixed-interval-radio').prop('checked', true);
});

$('#random-time').on("click", function() {
  $('#random-interval-radio').prop('checked', true);
});


function disablePauseBtn() {
  $('#pause-btn').prop('disabled', true);
}

function enablePauseBtn() {
  $('#pause-btn').prop('disabled', false);
}

function disableStartBtn() {
  $('#btn-for-starting-fixed-sequence').prop('disabled', true);
  $('#btn-for-starting-random-sequence').prop('disabled', true);
}

function enableStartBtn() {
  $('#btn-for-starting-fixed-sequence').prop('disabled', false);
  $('#btn-for-starting-random-sequence').prop('disabled', false);
}

function enableStopBtn() {
  $('#stop-btn').prop('disabled', false);
}

function disableStopBtn() {
  $('#stop-btn').prop('disabled', true);
}

function enableSkipBtn() {
  $('#skip-btn').prop('disabled', false);
}

function disableSkipBtn() {
  $('#skip-btn').prop('disabled', true);
}

function postMessageToUser(string) {
  $('#message').val(string);
}

function clearMessageToUser() {
  $('#message').val("");
}



function isSequenceAttrEmpty() {
  var sequenceArray = getSequenceAttrFromSequenceTextbox();
  return sequenceArray.length === 0;
}

function getSequenceFromTextboxVal() {
  return $('#sequence').val();
}

function addColorToSequenceTextbox(color) {
  var currentContent = getSequenceFromTextboxVal();
  var updatedContent = isSequenceTextboxEmpty() ? color : currentContent + ", " + color
  $('#sequence').val(updatedContent);
}

function standardizeSequenceAndParseToArray(sequence) {
  return sequence.toLowerCase().match(/red|white|green|yellow|black|blue/g);
}

function saveSequenceAttrOnSequenceTextbox(sequenceArray) {
  $('#sequence').attr("sequenceArray", sequenceArray);
}

function getSequenceAttrFromSequenceTextbox() {
  return $('#sequence').attr("sequenceArray");
}

//color square clicks
$('#red-square').on("click", function() {
  addColorToSequenceTextbox("red");
});

$('#black-square').on("click", function() {
  addColorToSequenceTextbox("black");
});

$('#green-square').on("click", function() {
  addColorToSequenceTextbox("green");
});

$('#blue-square').on("click", function() {
  addColorToSequenceTextbox("blue");
});

$('#yellow-square').on("click", function() {
  addColorToSequenceTextbox("yellow");
});

$('#white-square').on("click", function() {
  addColorToSequenceTextbox("white");
});

function isFixedIntervalChecked() {
  return $('input:radio[name=interval-type]:checked').val() === "fixed-interval";
}

function setHatMonikerOnPage(hat){
  switch(hat){
    case "red":
    case "rgb(255, 0, 0)":
      postMessageToUser("The Empath");
      break;
    case "blue":
    case "rgb(0, 0, 255)":
      postMessageToUser("The Manager");
      break;
    case "yellow":
    case "rgb(255, 255, 0)":
      postMessageToUser("The Optimist");
      break;
    case "black":
    case "rgb(0, 0, 0)":
      postMessageToUser("The Skeptic");
      break;
    case "white":
    case "rgb(255, 255, 255)":
      postMessageToUser("The Detective");
      break;
    case "green":
    case "rgb(0, 128, 0)":
      postMessageToUser("The Muse");
      break;
    default:
        console.log("No matching color found");
        break;
  }
}

function wasStopBtnClicked() {
  return document.getElementById("stop-btn").hasAttribute("stopped");
}

function setSequenceTextboxAttr(sequenceArray) {
  $('#sequence').attr("sequenceArray", sequenceArray);
}

function reset() {
  $('#stop-btn').attr('stopped', true);
  enableStartBtn();
  turnOffSkip();
  unpause();
  resetCounter();
  disableStopBtn();
  disablePauseBtn();
  disableSkipBtn();
}

$('#stop-btn').on("click", function() {
  reset();
  dingEndBell();
  postMessageToUser("Stopped");
});

function removeStoppedAttr() {
  $('#stop-btn').removeAttr('stopped');
}

function resetCounter() {
  $('#counter').text("0h 0m 0s");
}

$('#skip-btn').on("click", function() {
  $('#skip-btn').attr("skip", true);
});

function pause() {
  $('#counter').attr("paused", true);
}

$('#pause-btn').on("click", function() {
  pause();
  enableStartBtn();
  disableSkipBtn();
  disablePauseBtn();
  postMessageToUser("Paused");
});

function unpause() {
  $('#counter').removeAttr("paused");
}

function isCounterPaused() {
  return document.getElementById("counter").hasAttribute("paused");
}

function doesSkipBtnHaveAttr() {
  return document.getElementById("skip-btn").hasAttribute("skip");
}

function turnOffSkip() {
  $('#skip-btn').removeAttr("skip");
}

$('#hideCounter').on("click", function() {
  $('#counter').toggle();
});

function calculateSeconds(hours, minutes, seconds) {
  seconds += minutes * 60;
  seconds += hours * 60 * 60;
  return seconds;
}

function dingStartBell() {
  document.getElementById('start-bell').play();
}

function dingEndBell() {
  document.getElementById('end-bell').play();
}

function randomlyGrabHat() {
  var hatNumber = randomlySelectNumberForHat();
  var hat = getHatByNumber(hatNumber);
  setHatColorOnPage(hat);
  setHatMonikerOnPage(hat);
}

function getHatByNumber(n) {
  switch (n) {
    case 1:
      return 'white';
    case 2:
      return 'red';
    case 3:
      return 'green';
    case 4:
      return 'blue';
    case 5:
      return 'yellow';
    case 6:
      return 'black';
    default:
      console.log('unrecognized integer');
      return;
  }
  console.log("the switch wasn't hit...check for errors");
  return;
}

function setHatColorOnPage(color) {
  $('#hat').css('background-color', color);
}

//choosing the procedure

$('#showSequenceOptions').on("click", function() {
  $('#functionality').text("Sequence of Hats");
  $('#color-menu-panel').show();
  $('#action-form-legend').text("Sequence");
  $('#functionality').prop("sequenceOption", true);
  reset();

  $('#btns-for-fixed-sequence').show();
  $('#btns-for-random-sequence').hide();
  $('#fixed-sequence-instructions').show();
  $('#random-sequence-instructions').hide();
});

$('#showTimedOptions').on("click", function() {
  $('#functionality').text("Timed Random Hats");
  $('#color-menu-panel').hide();
  $('#action-form-legend').text("Action");
  $('#functionality').prop("sequenceOption", false);
  reset();

  $('#btns-for-fixed-sequence').hide();
  $('#btns-for-random-sequence').show();
  $('#fixed-sequence-instructions').hide();
  $('#random-sequence-instructions').show();
});


$('#getRandomHat').on("click", function() {
  reset();
  clearMessageToUser();
  randomlyGrabHat();
});


//random sequence of hats

function randomlySelectNumberForHat() {
  return Math.floor((Math.random() * 6) + 1);
}

function makeSequenceTextboxReadOnly() {
  $('#sequence').prop('readonly', true);
}

function makeSequenceTextboxWritable() {
  $('#sequence').prop('readonly', true);
}

function getTotalSecondsFromFixedIntervalForm() {

  var h = parseInt($('#hours').val());
  var m = parseInt($('#minutes').val());
  var s = parseInt($('#seconds').val());

  return calculateSeconds(h, m, s);
}

function prepareButtonsAndAttributesForStart() {
  disableStartBtn();
  enableSkipBtn();
  enableStopBtn();
  enablePauseBtn();
  removeStoppedAttr();
}

//for random interval

function getTotalSecondsFromCounter() {

  var textInCounter = $('#counter').text();

  var h = parseInt(textInCounter.match(/[0-9]+(?=h)/));
  var m = parseInt(textInCounter.match(/[0-9]+(?=m)/));
  var s = parseInt(textInCounter.match(/[0-9]+(?=s)/));

  return calculateSeconds(h, m, s);
}

function generateRandomTimeFromMinuteRange() {
  var min = parseFloat($('#lower-random-interval-limit').val());
  var max = parseFloat($('#upper-random-interval-limit').val());

  var minSeconds = Math.round(min * 60);
  var maxSeconds = Math.round(max * 60);

  return Math.floor(Math.random() * (maxSeconds - minSeconds + 1)) + minSeconds;
}
