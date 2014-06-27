/** @module lib/assessment.js
    @description javascript logic for assessment widgets
*/
'use strict';
var $ = require('jquery')
  , AssessmentGridWidget = require('./assessment/AssessmentGridWidget')

//if we're not in a browser the rest have no meaning
if('undefined' == typeof window) return
// var ace = require('brace');
// require('brace/mode/javascript');
// require('brace/theme/monokai');

function initCodeEditors(){
  // $('.code-input .asq-code-editor').each(function(){
  //   var aceEditor = ace.edit(this.id)
  //   , aceEditSession = aceEditor.getSession()
  //   , mode = $(this).parents('.code-input').eq(0).data('asq-syntax')
  //   , theme = $(this).parents('.code-input').eq(0).data('asq-theme');

  //   aceEditor.setTheme("ace/theme/" + theme);
  //   aceEditor.setFontSize(20);
  //   aceEditSession.setMode('ace/mode/'+ mode);

  //   //disable keyevent for document (to block impress)
  //   aceEditor.on("focus", function() {
  //     document.body.addEventListener("keyup", muteKeysForDocument, false );
  //     document.body.addEventListener("keydown", muteKeysForDocument, false );
  //   });

  //   aceEditor.on("blur", function() {
  //      document.body.removeEventListener("keyup", muteKeysForDocument);
  //      document.body.removeEventListener("keydown", muteKeysForDocument);
  //   });

  //   function muteKeysForDocument( event ) {
  //     event.stopPropagation();
  //   }
  // })
}

function initAssessmentGrids(eventBus){
  //create and index assessment grids by exercise
  var grids = Object.create(null);
  $('.asq-assess-grid-holder').each(function(){
     var exercideId =  $(this).closest('.asq-exercise').dataset.asqExerciseId;
     if("undefined" === typeof exercideId || exercideId === null) return;
     grids[exercideId] = new AssessmentGridWidget(this, {gradeStyle: "led"});
  });

  eventBus.on('asq:folo-connected', function(e){
    for (var key in grids){
      grids[key].addUser(e.user);
    }
  });

  eventBus.on('asq:folo-disconnected', function(e){
    for (var key in grids){
      grids[key].removeUser(e.user);
    }
  });

  eventBus.on('asq:new-assessment-job', function(e){
    if(grids[e.exerciseId]) {
      grids[e.exerciseId].setToNowAssessing(e.assessor.token, e.assessee.token);
    }
  });

  eventBus.on('asq:idle-assessment-job', function(e){
    if(grids[e.exerciseId]) {
      grids[e.exerciseId].setToIde(e.assessor.token, e.assessee.token);
    }
  });

  eventBus.on('asq:assessment', function(e){
    if(grids[e.exerciseId]) {
      grids[e.exerciseId].setGrade(e.assessor.token, e.assessee.token, e.grade);
    }
  });
}

function setupMicroformatComponents(eventBus){
  initCodeEditors();
  initAssessmentGrids(eventBus);
}

module.exports = {
  initCodeEditors: initCodeEditors,
  initAssessmentGrids: initAssessmentGrids,
  setupMicroformatComponents : setupMicroformatComponents,
  AssessmentGridWidget : AssessmentGridWidget
}