/** @module lib/assessment.js
    @description javascript logic for assessment widgets
*/
'use strict';
var $ = require('jquery')
  , AssessmentGridWidget = require('./assessment/AssessmentGridWidget')
  , roles = Object.create(null);

roles.presenter = configurePresenter;
roles.viewer = configurureViewer;

function configureMicroformatComponents(role,  eventBus){
  if(roles[role]){
    roles[role](eventBus);
  }
}

function configurePresenter (eventBus){
  initCodeEditors();
  initAssessmentGrids(eventBus);
} 

function configurureViewer (eventBus){
  initCodeEditors();
} 

 

//if we're not in a browser the rest have no meaning
if('undefined' == typeof window) return
var ace = require('brace');
require('brace/mode/javascript');
require('brace/theme/monokai');

function initCodeEditors(){
  $('.code-input .asq-code-editor').each(function(){
    var aceEditor = ace.edit(this.id)
    , aceEditSession = aceEditor.getSession()
    , mode = $(this).parents('.code-input').eq(0).data('asq-syntax')
    , theme = $(this).parents('.code-input').eq(0).data('asq-theme');

    aceEditor.setFontSize(20);
    aceEditor.setTheme("ace/theme/" + theme);
    aceEditSession.setMode('ace/mode/'+ mode);
    aceEditor.resize();

    //disable keyevent for document (to block impress)
    aceEditor.on("focus", function() {
      document.body.addEventListener("keyup", muteKeysForDocument, false );
      document.body.addEventListener("keydown", muteKeysForDocument, false );
    });

    aceEditor.on("blur", function() {
       document.body.removeEventListener("keyup", muteKeysForDocument);
       document.body.removeEventListener("keydown", muteKeysForDocument);
    });

    function muteKeysForDocument( event ) {
      event.stopPropagation();
    }
  })
}

function initCodeEditorsForAssessment(){
  $('.asq-assessment .asq-code-editor').not('.ace_editor').each(function(){
    var aceEditor = ace.edit(this.id)
    , aceEditSession = aceEditor.getSession()
    , questionId = $(this).closest('.asq-question-preview').eq(0).data('asq-question')
    , mode = $('.asq-question[data-question-id=' + questionId + ']').eq(0).data('asq-syntax')
    , theme = $('.asq-question[data-question-id=' + questionId + ']').eq(0).data('asq-theme');

    aceEditor.setFontSize(20);
    aceEditor.setTheme("ace/theme/" + theme);
    aceEditSession.setMode('ace/mode/'+ mode);
    aceEditor.resize();
    aceEditor.setReadOnly(true);

    //disable keyevent for document (to block impress)
    aceEditor.on("focus", function() {
      document.body.addEventListener("keyup", muteKeysForDocument, false );
      document.body.addEventListener("keydown", muteKeysForDocument, false );
    });

    aceEditor.on("blur", function() {
       document.body.removeEventListener("keyup", muteKeysForDocument);
       document.body.removeEventListener("keydown", muteKeysForDocument);
    });

    function muteKeysForDocument( event ) {
      event.stopPropagation();
    }
  })
}

function initAssessmentGrids(eventBus){
  //create and index assessment grids by exercise

  var grids = Object.create(null);
  $('.asq-assess-grid-holder').each(function(){
     var exerciseId =  $(this).closest('.asq-exercise')[0].dataset.asqExerciseId;
     if("undefined" === typeof exerciseId || exerciseId === null) return;
     grids[exerciseId] = new AssessmentGridWidget(this, {gradeStyle: "led"});
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
      grids[e.exerciseId].setToIdle(e.assessor.token, e.assessee.token);
    }
  });

  eventBus.on('asq:assess', function(e){
    if(grids[e.exerciseId]) {
      grids[e.exerciseId].setScore(e.assessor.token, e.assessee.token, e.score);
    }
  });
}

module.exports = {
  initCodeEditors: initCodeEditors,
  initCodeEditorsForAssessment : initCodeEditorsForAssessment,
  initAssessmentGrids: initAssessmentGrids,
  configureMicroformatComponents : configureMicroformatComponents,
  AssessmentGridWidget : AssessmentGridWidget
}