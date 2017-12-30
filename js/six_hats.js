//TODO should put error messages in otherwise hidden divs just above their target element; this allows for multiple error messages to appear at once, and keeps only
//hats in the box above the color
//remove error messages in masse if there is a pass

$(document).ready(function(){
  $('#functionality').prop("usingFixedSequence", true);
  }
);

$('#btn-for-starting-fixed-sequence').on("click", function() {
  //bitwise & will not shortcircuit if first operand is false, thus allowing for both checks and error messages to appear
  if (areTimeFormsValid() & isSequenceFormValid()) {
    prepareButtonsAndAttributesForStart();
    var sequence, seconds, hat;

    if (isCounterPaused()) {
      hat = getCurrentHatColor();
      seconds = getTotalSecondsFromCounter() - 1;
      unpause();
    } else {
      sequence = getSequenceFromTextboxVal();
      sequence = standardizeSequenceAndParseToArray(sequence);
      hat = sequence.shift();
      saveSequenceAttrOnSequenceTextbox(sequence);
      seconds = isFixedIntervalChecked() ? getTotalSecondsFromFixedIntervalForm() : generateRandomTimeFromMinuteRange()
    }

    clearMessageToUser();
    makeSequenceTextboxReadOnly();
    displayHatAndPassTimeToCountdown(hat, seconds);
  }
});


function areTimeFormsValid() {
  return isFixedIntervalFormValid() & isRandomIntervalFormValid()
}

function isSequenceFormValid(){
  if (isSequenceTextboxEmpty()){
    giveDivRedBorder("#fixed-sequence-instructions");
    displayErrorMessageForDiv("#fixed-sequence-error-message", 'No sequence given');
    return false;
  }

  var sequence = getSequenceFromTextboxVal();
  jQuery.trim(sequence);
  var regexPattern = /(red|white|blue|black|yellow|green|,| )+/g;
  var matches = sequence.match(regexPattern);

  if (matches == null || matches[0].length != sequence.length){
    giveDivRedBorder("#fixed-sequence-instructions");
    displayErrorMessageForDiv("#fixed-sequence-error-message", 'Unrecognized hats');
    return false;
  }

  removeErrorIndicatorsForFixedIntervalForm();
  return true;
}

function prepareButtonsAndAttributesForStart() {
  disableStartBtn();
  enableSkipBtn();
  enableStopBtn();
  enablePauseBtn();
  removeStoppedAttr();
}

function isCounterPaused() {
  return document.getElementById("counter").hasAttribute("paused");
}

function getCurrentHatColor(){
  return $('#hat').css("background-color");
}

function getTotalSecondsFromCounter() {

  var textInCounter = $('#counter').text();

  var h = parseInt(textInCounter.match(/[0-9]+(?=h)/));
  var m = parseInt(textInCounter.match(/[0-9]+(?=m)/));
  var s = parseInt(textInCounter.match(/[0-9]+(?=s)/));

  return calculateSeconds(h, m, s);
}

function unpause() {
  $('#counter').removeAttr("paused");
}

function getSequenceFromTextboxVal() {
  return $('#sequence').val();
}

function standardizeSequenceAndParseToArray(sequence) {
  return sequence.toLowerCase().match(/red|white|green|yellow|black|blue/g);
}

function saveSequenceAttrOnSequenceTextbox(sequenceArray) {
  $('#sequence').attr("sequenceArray", sequenceArray);
}

function isFixedIntervalChecked() {
  return $('input:radio[name=interval-type]:checked').val() === "fixed-interval";
}

function getTotalSecondsFromFixedIntervalForm() {

  var h = parseInt($('#hours').val());
  var m = parseInt($('#minutes').val());
  var s = parseInt($('#seconds').val());

  return calculateSeconds(h, m, s);
}

function generateRandomTimeFromMinuteRange() {
  var min = parseFloat($('#lower-random-interval-limit').val());
  var max = parseFloat($('#upper-random-interval-limit').val());

  var minSeconds = Math.round(min * 60);
  var maxSeconds = Math.round(max * 60);

  return Math.floor(Math.random() * (maxSeconds - minSeconds + 1)) + minSeconds;
}

function clearMessageToUser() {
  $('#message').val("");
}

function makeSequenceTextboxReadOnly() {
  $('#sequence').prop('readonly', true);
}

function displayHatAndPassTimeToCountdown(hat, seconds) {
  setHatColorOnPage(hat);
  setHatMonikerOnPage(hat);
  dingStartBell();
  isUsingFixedSequence() ? countdownForFixedSequence(seconds) : countdownForRandomSequence(seconds)
}
//

function displayErrorMessageForDiv(divId, message){
  $(divId).text(message);
}

function isFixedIntervalFormValid() {
  var h = $('#hours').val();
  var m = $('#minutes').val();
  var s = $('#seconds').val();

  var hoursEmpty =  h === "";
  var minutesEmpty = m === "";
  var secondsEmpty = s === "";

  if (hoursEmpty || minutesEmpty || secondsEmpty) {
    displayErrorMessageForDiv("#fixed-time-error-message", 'Fill all fields');
    giveDivRedBorder('#fixed-time');
    return false;
  }

  if (h<0||m<0||s<0){
    displayErrorMessageForDiv("#fixed-time-error-message", 'No negative time');
    giveDivRedBorder('#fixed-time');
    return false;
  }

  removeErrorIndicatorsForFixedIntervalForm();
  return true;
}

function removeErrorMessageFromDiv(divId){
  $(divId).text("");
}

function removeErrorIndicatorsForRandomIntervalForm(){
  removeRedBorderFromDiv("#random-time");
  removeErrorMessageFromDiv("#random-time-error-message");
}


function removeErrorIndicatorsForFixedIntervalForm(){
  removeRedBorderFromDiv("#fixed-time");
  removeErrorMessageFromDiv("#fixed-time-error-message");
}

function isRandomIntervalFormValid() {
  var lowerLimit = $('#lower-random-interval-limit').val();
  var upperLimit = $('#upper-random-interval-limit').val();

  if (lowerLimit === "" || upperLimit === "") {
    displayErrorMessageForDiv("#random-time-error-message", 'Fill all fields');
    giveDivRedBorder('#random-time');
    return false;
  }

  if (lowerLimit<0||upperLimit<0){
    displayErrorMessageForDiv("#random-time-error-message", 'No negative time');
    giveDivRedBorder('#random-time');
    return false;
  }


  if (lowerLimit >= upperLimit) {
    displayErrorMessageForDiv("#random-time-error-message", 'Lower < Upper!');
    giveDivRedBorder('#random-time');
    return false;
  }

  removeErrorIndicatorsForRandomIntervalForm();
  return true;
}

function removeErrorIndicatorsForFixedIntervalForm(){
  removeRedBorderFromDiv("#fixed-sequence-instructions");
  removeErrorMessageFromDiv("#fixed-sequence-error-message");
}



function giveDivRedBorder(divId){
  $(divId).css('border', '2px solid red');
}

function removeRedBorderFromDiv(divId){
  $(divId).css('border', 0);
}

function isSequenceTextboxEmpty() {
  var content = $('#sequence').val();
  jQuery.trim(content);
  return content.length === 0;
}

function postMessageToUser(string) {
  $('#message').val(string);
}





function disableStartBtn() {
  $('#btn-for-starting-fixed-sequence').prop('disabled', true);
  $('#btn-for-starting-random-sequence').prop('disabled', true);
}

function enableStartBtn() {
  $('#btn-for-starting-fixed-sequence').prop('disabled', false);
  $('#btn-for-starting-random-sequence').prop('disabled', false);
}

function disableSkipBtn() {
  $('#skip-btn').prop('disabled', true);
}

function enableSkipBtn() {
  $('#skip-btn').prop('disabled', false);
}

function disableStopBtn() {
  $('#stop-btn').prop('disabled', true);
}

function enableStopBtn() {
  $('#stop-btn').prop('disabled', false);
}

function disablePauseBtn() {
  $('#pause-btn').prop('disabled', true);
}

function enablePauseBtn() {
  $('#pause-btn').prop('disabled', false);
}

function removeStoppedAttr() {
  $('#stop-btn').removeAttr('stopped');
}
















function calculateSeconds(hours, minutes, seconds) {
  seconds += minutes * 60;
  seconds += hours * 60 * 60;
  return seconds;
}





function setHatColorOnPage(color) {
  $('#hat').css('background-color', color);
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

function dingStartBell() {
  document.getElementById('start-bell').play();
}

function dingEndBell() {
  document.getElementById('end-bell').play();
}

function isUsingFixedSequence(){
  return $('#functionality').prop("usingFixedSequence") == true;
}
//TODO finish formatting functions -- stopped here
function countdownForFixedSequence(seconds) {

  var count = seconds + 1;

  var interval = setInterval(function() {
    var shouldSkip = wasSkipClicked();

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
        var sequence = getSequenceAttrFromSequenceTextbox();
        sequence = standardizeSequenceAndParseToArray(sequence);

        var seconds = isFixedIntervalChecked() ? getTotalSecondsFromFixedIntervalForm() : generateRandomTimeFromMinuteRange()
        turnOffSkip();
        if (isSequenceAttrEmpty()) {
          reset();
          postMessageToUser("Sequence complete");
          dingEndBell();
        } else {
          var hat = sequence.shift();
          saveSequenceAttrOnSequenceTextbox(sequence);
          displayHatAndPassTimeToCountdown(hat, seconds);
        }
      }
    }
  }, 1000);
}

function wasSkipClicked() {
  return document.getElementById("skip-btn").hasAttribute("skip");
}

function wasStopBtnClicked() {
  return document.getElementById("stop-btn").hasAttribute("stopped");
}

function calculateCounterValuesAndDisplay(count){
  var h, m, s;

  h = Math.floor((count % (60 * 60 * 24)) / (60 * 60));
  m = Math.floor((count % (60 * 60)) / (60));
  s = Math.floor(count % 60);

  $('#counter').text(h + "h " + m + "m " + s + "s ");
}

function getSequenceAttrFromSequenceTextbox() {
  return $('#sequence').attr("sequenceArray");
}

$('#btn-for-starting-random-sequence').on("click", function() {
  if (areTimeFormsValid()) {
    //removeRedBorderFromDiv();
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

function randomlySelectNumberForHat() {
  return Math.floor((Math.random() * 6) + 1);
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

function countdownForRandomSequence(seconds) {
  var count = seconds + 1;

  var interval = setInterval(function() {
    var shouldSkip = wasSkipClicked();

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

function turnOffSkip() {
  $('#skip-btn').removeAttr("skip");
}

$('#fixed-time').on("click", function() {
  $('#fixed-interval-radio').prop('checked', true);
});

$('#random-time').on("click", function() {
  $('#random-interval-radio').prop('checked', true);
});










function isSequenceAttrEmpty() {
  var sequenceArray = getSequenceAttrFromSequenceTextbox();
  return sequenceArray.length === 0;
}



function addColorToSequenceTextbox(color) {
  var currentContent = getSequenceFromTextboxVal();
  var updatedContent = isSequenceTextboxEmpty() ? color : currentContent + ", " + color
  $('#sequence').val(updatedContent);
}







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
  makeSequenceTextboxWritable();
}

$('#stop-btn').on("click", function() {
  reset();
  makeSequenceTextboxWritable();
  dingEndBell();
  postMessageToUser("Stopped");
});



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









$('#hideCounter').on("click", function() {
  $('#counter').toggle();
});





function randomlyGrabHat() {
  var hatNumber = randomlySelectNumberForHat();
  var hat = getHatByNumber(hatNumber);
  setHatColorOnPage(hat);
  setHatMonikerOnPage(hat);
}






$('#showSequenceOptions').on("click", function() {
  $('#functionality').text("Sequence of Hats");
  $('#color-menu-panel').show();
  $('#action-form-legend').text("Sequence");
  $('#functionality').prop("usingFixedSequence", true);
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
  $('#functionality').prop("usingFixedSequence", false);
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





function makeSequenceTextboxWritable() {
  $('#sequence').prop('readonly', false);
}
