/** @module lib/assessment.js
    @description javascript logic for assessment widgets
*/
'use strict';

// used for escaping
var entityMap = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': '&quot;',
  "'": '&#39;',
  "/": '&#x2F;'
};

function escapeHtml(string) {
  return String(string).replace(/[&<>"'\/]/g, function (s) {
    return entityMap[s];
  });
}

function getElOpeningTag(el){
    var str ="<"
    str += $(el).prop("tagName").toLowerCase()
    
    //get all attribures
    $.each(el.attributes, function() {
    // this.attributes is not a plain object, but an array
    // of attribute nodes, which contain both the name and value
        if(this.specified && this.name !=='data-asq-selected' ) {
          str += ' ' + this.name
          str += '="' + this.value + '"'
        }
    });
    str+=">"
    return str;
}

// recursive function that creates the escaped tree of the html
// annotated with spans
function createTree($el, treeStr, tabwidth){
  var nextTabwidth = tabwidth || "";
  $el.children().each(function(){
   var $this = $(this)
     , spanOpenTag = "<span>";
    
   if($this.attr('data-asq-selected') === "true"){
       spanOpenTag = '<span style="background-color:#fd2343;">';
   }
   treeStr += tabwidth + spanOpenTag
   treeStr += escapeHtml(getElOpeningTag(this))
   treeStr += '</span>'+ '\n';
    
   //generate tree for children of current
   nextTabwidth = tabwidth + "  "
   treeStr = createTree($this, treeStr, nextTabwidth);
    
   //back to current 
   treeStr += tabwidth + spanOpenTag
   treeStr +=  escapeHtml("</" + $this.prop("tagName").toLowerCase());
   treeStr += '</span>'+ '\n';
  });
      
  return treeStr;
}

//if we're not in a browser the rest have no meaning
if('undefined' !== typeof window){

  var $ = require('jquery')
  , AssessmentGridWidget = require('./assessment/AssessmentGridWidget')
  , roles = Object.create(null);

  var configureMicroformatComponents = function(role,  eventBus){
    if(roles[role]){
      roles[role](eventBus);
    }
  }

  var configurePresenter = function (eventBus){
   // initCodeEditors();
    initAssessmentGrids(eventBus);
    initCSSSelect(eventBus);
    initJSFunctionBody(eventBus);
  } 

  var configurureViewer = function(eventBus){
   // initCodeEditors();
   initCSSSelect(eventBus);
   initJSFunctionBody(eventBus);
  } 

  // var ace = require('brace');
  // require('brace/mode/javascript');
  // require('brace/theme/monokai');

  var initCodeEditors = function(){
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
    });
  }

  var initCodeEditorsForAssessment = function(){
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

  var initAssessmentGrids = function(eventBus){
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

  var initCSSSelect = function(eventBus){
    $(function(){

      $('.asq-css-select').each(function(){
        // instantiate code pane
        var $this = $(this);
        var $codePane = $this.find("code").eq(0);
        var newHtml = $('<textarea/>').html($this.attr('data-asq-code')).val();
        var $vDOM = $('<div>' + newHtml + '</div>');
        var codeTree = createTree($vDOM, "", "");
        $codePane.html(codeTree);
        
        // magic starts here
        var $selInput = $this.find('input[type="text"]').eq(0);
        $selInput.on('input', function(){
            var val = $selInput[0].value
            var $clone = $vDOM.clone();
            var selected = $clone.find(val).each(function(){
                $(this).attr('data-asq-selected', "true");
            });
            codeTree = createTree($clone, "", "");
            $codePane.html(codeTree);
        })
      });
    })
  }


  var initJSFunctionBody = function(eventBus){
    $(function(){
      var interval = 150;
      $('.asq-js-function-body').each(function(){
        var $root = $(this);
        var header = $root.find('.asq-code-header').text();
        var footer = $root.find('.asq-code-footer').text();
        var testCommand = $root.find('.asq-evaluate').text();
        var $codeInput = $root.find('.asq-code-input');
        var $asqResult = $root.find('.asq-result');
        var $asqResultWrapper = $root.find('.asq-result-wrapper')
        var solution= $root.attr('data-asq-correct-output');
        var timer;
        
        var getSubmittedCode = function (){
          var submission = header;
          submission += $codeInput.text();
          submission += footer;
          submission += ';\n' + testCommand;
          
          return submission;
        }

        var evalInput = function(expr){
          var result;
          try{
              result = eval(expr);
          }catch(err){
              result = err.toString();
          }    
          return JSON.stringify(result, undefined, 2);
        }
        
        var update = function (){
          var submission = getSubmittedCode();
          var result = evalInput(submission);
          $asqResult.text(result);
          if("undefined" == typeof solution) return;
          if(result === solution){
             $asqResultWrapper.addClass('asq-correct');
          }else{
             $asqResultWrapper.removeClass('asq-correct');
          }        
        }
        
        $codeInput.on('input', function(evt){
          clearInterval(timer);
          timer = setTimeout(update, interval);
        }); 
      });
    })
  }


 roles.presenter = configurePresenter;
 roles.viewer = configurureViewer;


  module.exports = {
    initCodeEditors: initCodeEditors,
    initCodeEditorsForAssessment : initCodeEditorsForAssessment,
    initAssessmentGrids: initAssessmentGrids,
    configureMicroformatComponents : configureMicroformatComponents,
    AssessmentGridWidget : AssessmentGridWidget
  }

}