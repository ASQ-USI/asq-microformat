/** @module previewer/asq.js
    @description Previewer for ASQ microformat
*/
/* GLOBAL: $ */
'use strict';


require('when/monitor/console');
var dust          = require('dustjs-linkedin')
, when            = require('when')
, Parser          = require('../lib/parser')
, logger          = console
, MarkupGenerator = require('../lib/markupGenerator')
, assessment      = require('../lib/assessment')
, _               = require('lodash');

require('dustjs-helpers');

function start(userType, cb) {
  //parse
  var asqParser = new Parser();
  var parsedData = asqParser.parse('')
  parsedData = fakeDatabaseIds(parsedData);

  //render
  var asqRenderer = new MarkupGenerator()
  asqRenderer.render('', parsedData.exercises, parsedData.rubrics,
    { userType: userType, mode: 'preview' }).then(
  function(html) {
    assessment.initCodeEditors();
    generatesampleData(userType);
    handleModal(parsedData);
    if (typeof cb !== 'undefined' && typeof cb === 'function') {
      cb.call(this, null, true)
    }
  },
  function(err) {
    logger.error(err)
    if (typeof cb !== 'undefined' && typeof cb === 'function') {
      cb.call(this, err)
    }
  });
}

function init(cb) {
  //detect if we need to render anything or the user is just chilin
  var search = window.location.search;
  if (search.match(/viewer/)) {
    start('viewer',cb);
  } else if (search.match(/presenter/)) {
    start('presenter',cb);
  } else if (typeof cb !== 'undefined' && typeof cb === 'function') {
    cb.call(this, null, true);
  }
}

function fakeDatabaseIds(data) {
  var exercises = data.exercises
  , questions   = []
  , rubrics     = data.rubrics
  , stats       = data.stats
  , qIdsMap     = {}
  , id          = 0
  , i, j, len1, len2, htmlId;

  for (i = 0, len1 = exercises.length; i < len1; i++) {
    for (j = 0, len2 = exercises[i].questions.length; j < len2; j++) {
      exercises[i].questions[j].id = 'q' + id;
      exercises[i].questions[j]._id = 'q' + id;
      qIdsMap[exercises[i].questions[j].htmlId] = 'q' + id;
      id++;
    }
  }

  i = rubrics.length;
  while(i--) {
    htmlId = rubrics[i].question;
    if(! qIdsMap.hasOwnProperty(htmlId)) {
      console.error('Invalid question id ref ' + htmlId +
        ' for rubric on slide ' + rubrics[i].stemText);
    }
    rubrics[i]._id = 'r' + i;
    rubrics[i].id  = 'r' + i;
    rubrics[i].question = qIdsMap[htmlId];
  }

  i = stats.length;
  while(i--) {
    htmlId = stats[i].questionHtmlId;
    if(! qIdsMap.hasOwnProperty(htmlId)) {
      console.error('Invalid question id ref ' + htmlId +
        ' for stat on slide ' + stats[i].slideHtmlId);
    }
    stats[i]._id = 'r' + i;
    stats[i].id  = 'r' + i;
    stats[i].questionId = qIdsMap[htmlId];
  }
  return data;
}

function generatesampleData(mode) {
  if ('presenter' === mode) {
    // Progress bar for presenter
    $('.asq-exercise').each(function() {
      var audience = Math.floor(Math.random() * (347 - 5 + 1) + 5);
      var done = Math.floor(Math.random() * (audience - 1 + 1) + 1);
      $(this).find('.progress-bar').attr('style', 'width:' +
        Math.round(done / audience * 100).toString() + '%;')
      $(this).find('.progressNum').text(done + '/' + audience +
        ' answers received.');
    });
  }
}

// Add interaction for modal
// (This is done automatically in Asq with the help of sockets.)
function handleModal(data) {
  var exercises = data.exercises;
  var rubrics   = data.rubrics;
  var i = exercises.length;
  var done = [], toRemove = [];
  var j, k, len, exercise, question;
  // This usually happens in ASQ with the DB
  // Don't bother understanding it, just consider it as magic.
  // except if you change the parsing of exercises, question or rubrics
  // then update it to keep it working
  while (i--) {
    exercise = exercises[i];
    j = exercise.questions.length;
    while (j--) {
      question = exercise.questions[j];
      question.rubrics = [];
      for (k = 0, len = rubrics.length; k < len; k++) {
        if (rubrics[k].question === question.id) {
          question.rubrics.push(rubrics[k]);
        }
      }
      if (question.rubrics.length === 0) {
        exercise.questions.splice(j, 1);
      }
    }
    if (exercise.questions.length === 0) {
      exercises.splice(i, 1);
    }
  }

  if (exercises.length > 0) {
    var done = [];
    i = exercises.length;
    var $slide;
    while (i--) {

      $slide = $('#' + exercise.htmlId).parent('.step');
      if ($slide.length !== 1 || done.indexOf($slide[0].id) > -1) {
        continue;
      }
      done.push(exercise.htmlId);
      // Add open modal button to slide
      $slide.prepend('<a href="#" class="ap-modal-show" style="position:absolute;top:0;left:0;display:block;background:#ccc;border-bottom-left-radius:4px;font-size: 0.6em;padding:5px;">Expand</a>');
    }
    if (done.length > 0) {
      // Modal show handler with fetching of exercises
      $(document).on('click', '.ap-modal-show', function showModal(evt) {
        evt.preventDefault();
        var exIds = [];
        $(evt.target).siblings('.asq-exercise').each(function() {
          exIds.push(this.id);
        });
        var currentExs = [];
        var i, len;
        for (i = 0, len = exercises.length; i < len; i++) {
          if (exIds.indexOf(exercises[i].htmlId) > -1) {
            exercise = exercises[i];
            j = exercise.questions.length;
            while(j--) {
              question = exercise.questions[j];
              if ('multi-choice' === question.questionType) {
                question.submission = Array.apply(null,
                  new Array(question.questionOptions.length))
                    .map(Boolean.prototype.valueOf, false);
                var correct = Math.floor(Math.random() * (question.questionOptions.length));
                question.submission[correct] = true;
              } else if ('text-input' === question.questionType) {
                question.submission = 'Text Input Answer';
              }
              else if ('code-input' === question.questionType) {
                question.submission = 'Code Input Answer';
              }
              question.confidence = Math.floor(Math.random() * (5 - 1 + 1) + 1);
            }
            currentExs.push(exercises[i]);
          }
        }
        dust.render('assessment-viewer', { exercises : currentExs },
          function onRender(err, out) {
            if (err) { console.error(err); }
            else {
              $('#am-modal').html(out);
              // Add modal close button
              $('#am-modal').prepend('<a id="ap-modal-close" href="#" style="position:fixed;top:0;left:0;font-size:1em;z-index:1000;background:#ccc;border-bottom-left-radius:4px;display:block;padding:8px;">Close</a>');
              $('#am-modal .am-flex-handle').drags()
              $('#am-modal-container').fadeIn();
            }
          })
      });
      // Handler to close modal
      $(document).on('click', '#ap-modal-close', function closeModal(evt) {
        evt.preventDefault();
        $('#am-modal-container').fadeOut();
      });
    }
  }
}

module.exports = {
  init: init
};