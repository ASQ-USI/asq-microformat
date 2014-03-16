/** @module lib/assessment.js
    @description javascript logic for assessment widgets
*/
'use strict';
var $ = require('jQuery')

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

    aceEditor.setTheme("ace/theme/" + theme);
    aceEditor.setFontSize(20);
    aceEditSession.setMode('ace/mode/'+ mode);

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

module.exports = {
  initCodeEditors: initCodeEditors
}