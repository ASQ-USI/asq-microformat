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

function start($el, userType, cb) {
  //parse
  var asqParser = new Parser();
  var parsedData = asqParser.parse($el[0].outerHTML)
  parsedData = fakeDatabaseIds(parsedData);
  //render
  var asqRenderer = new MarkupGenerator()
  asqRenderer.render(parsedData.html, parsedData.exercises, parsedData.rubrics,
    { userType: userType, mode: 'preview' }).then(
  function(out) {
    $el[0].outerHTML = out;
    assessment.initCodeEditors();
    generatesampleData(userType);
    var exercises = handleRubrics(parsedData); // get exercises with rubrics (with fake data)
    handleSubmit(exercises);
    if (typeof cb !== 'undefined' && typeof cb === 'function') {
      cb.call(this, null, out)
    }
  },
  function(err) {
    logger.error(err)
    if (typeof cb !== 'undefined' && typeof cb === 'function') {
      cb.call(this, err)
    }
  });
}

function init($el, cb) {
  //detect if we need to render anything or the user is just chilin
  var search = window.location.search;
  if (search.match(/viewer/)) {
    start($el, 'viewer', cb);
  } else if (search.match(/presenter/)) {
    start($el, 'presenter', cb);
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

function handleSubmit(exercises) {
  // Inject empty modal for rubrics
  $('<div id="asq-rubric-expanded-container"><button id="asq-rubric-reduce"><i class="glyphicon glyphicon-remove"></i></button><div id="asq-rubric-expanded"></div></div>')
    .appendTo($('body')).hide(); // Modal for expanded rubrics

  // Handler for question submit button
  $(document).on('click', '.asq-exercise button[type="submit"]', function questionSumbitHandler(evt) {
    evt.preventDefault();
    var $exercise = $(evt.target).closest('.asq-exercise');
    //disable submission form
    $exercise.find(':input').attr('disabled', true);
    $exercise.find('.asq-rating').addClass('disabled')

    // fadeout questions and insert wait msg
    $exercise.fadeTo(600, 0.3, function() {
      $('<span class="asq-submit-wait"><span class="label label-default"><i class="asq-spinner glyphicon glyphicon-refresh"></i> Submitting your answer...</span></span>')
        .insertAfter($exercise).fadeIn(600);
    });
    var delay = when.defer();
    setTimeout(function() { delay.resolve(true); }, 2000);
    var getExercise = function() { // I know this is bad, but this is just to fake it...
      var i ,len;
      var selected = [];
      for(i = 0, len = exercises.length; i < len; i++) {
        if ($exercise.attr('id') === exercises[i].htmlId) {
          selected.push(exercises[i]);
        }
      }
      return when.resolve(selected);
    };
    when.all([getExercise(), delay.promise]).then(function onSubmission(data) {
      var exercises = data[0];
      if (exercises.length === 0) { // No rubrics
        // Remove wait message
        $exercise.siblings('.asq-submit-wait').fadeOut(600).remove();
        // Success message
        $('<span class="asq-submit-success"><span class="label label-success"><i class="glyphicon glyphicon-ok"></i> Answer submitted successfully.</span></span>')
        .insertAfter($exercise).fadeIn(600);
        return;
      }

      // Rubrics
      $exercise.fadeOut(600);
      // Remove wait message
      $exercise.siblings('.asq-submit-wait').fadeOut(600).remove();
      dust.render('assessment-viewer', { exercises : exercises },
        function onRender(err, out) {
          if (err) { console.error(err); }
          else {
            out = '<button class="asq-rubric-expand"><i class="glyphicon glyphicon-fullscreen"></i></button>' + out;
            $(window).on('resize', function displayExpandBtn() {
              console.log('resize');
              var $btn = $('.step.present').find('.asq-rubric-expand');
              if ($btn.length === 0) { return; }
              $btn.css('top',(-$btn.offset().top) + 'px');
            })
            $(out).insertAfter($exercise).hide().fadeIn(600, function() {
                $(this).find('.asq-flex-handle').drags();
                console.log('should not be called twice')
                var $btn = $('.step.present').find('.asq-rubric-expand');
                if ($btn.length === 0) { return; }
                $btn.css('top', '400px');
            });
          }
      });
    });
    return;
  });

  // Expand rubric logic
  var restoreId = null;
  // Expand handler
  $(document).on('click', '.asq-rubric-expand', function expandRubric(evt) {
    var $slide = $(evt.target).parent().siblings('.asq-assessment-container');

    // Restore existing content to slide from modal.
    if (restoreId) {
      $('#' + restoreId).append($('#asq-rubric-expanded').html($slide));
    }

    // Set content of modal from slide and dispaly modal
    restoreId = $slide.closest('.step').attr('id');
    $('#asq-rubric-expanded').html($slide);
    $('#asq-rubric-expanded-container').fadeIn(600);
  });

  // Reduce rubric handler
  $(document).on('click', '#asq-rubric-reduce', function reduceRubric(evt) {
    if (restoreId) { // Restore existing content to slide from modal.
      $('#' + restoreId).append($('#asq-rubric-expanded').html());
    }
    // Empty modal, reset restore id and hide modal..
    $('#asq-rubric-expanded').html('');
    restoreId = null;
    $('#asq-rubric-expanded-container').fadeOut(600);
  });

  // Handler for rubric submit logic
  $(document).on('click', '.asq-assessment button[type="submit"]', function rubricSubmitHandler(evt) {
    evt.preventDefault();

    // Get Submission
    var submission  = [];
    var $assessment = $(evt.target).closest('.asq-assessment-inner');
    $assessment.find('.asq-flex-box').each(function() {

      // submission per question
      var qId = $(this).attr('data-question');
      submission[qId] = [];
      $(this).children('.asq-rubric').find('[data-rubric]').each(function() {

        // Rubric for each question
        var rId     = $(this).attr('data-rubric');
        var rubric  = {};
        rubric[rId] = [];

        // Selected rubric for questions
        $(this).find('input[type=checkbox], input[type=radio]').each(function() {
          rubric[rId].push([$(this).is(':checked'), $(this).val()]);
        });
        submission[qId].push(rubric);
      });
    });
    console.dir(submission);

    // disable inputs
    $assessment.find(':input').attr('disabled', true);
    $assessment.find('p.text-right > button').attr('disabled', true); //submit btn
    $assessment.find('p.text-right .asq-rating').attr('disabled', true).addClass('disabled'); //submit btn

    $assessment.fadeTo(600, 0.3, function() {
      $('<span class="asq-submit-wait"><span class="label label-default"><i class="asq-spinner glyphicon glyphicon-refresh"></i> Submitting your assessment...</span></span>')
        .insertAfter($assessment).fadeIn(600);
    });
  });
}

// Add interaction for modal
// (This is done automatically in Asq with the help of sockets.)
function handleRubrics(data) {
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
    i = exercises.length;
    var $slide;
    while (i--) {

      $slide = $('#' + exercise.htmlId).parent('.step');
      if ($slide.length !== 1 || done.indexOf($slide[0].id) > -1) {
        exercises.splice(i, 1);
      }
      // Add open modal button to slide
      //$slide.prepend('<a href="#" class="ap-rubric-show" style="position:fixed;top:0;right:0;display:block;background:#ccc;border-bottom-left-radius:4px;font-size: 0.6em;padding:5px;">Show Rubrics</a>');
    }
    if (exercises.length > 0) {
      // Modal show handler with fetching of exercises
      var currentExs = [];
      var i, len;
      for (i = 0, len = exercises.length; i < len; i++) {
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
      // Handler to close modal
      // $(document).on('click', '#ap-rubric-hide', function closeModal(evt) {
      //   evt.preventDefault();
      //   $('#asq-modal-container').fadeOut();
      // });
      return currentExs;
    } else {
      return [];
    }
  }
}

module.exports = {
  init: init
};