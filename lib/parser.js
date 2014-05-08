/** @module lib/parser
    @description Parse HTML files to extract assessment information
*/

/*
* node.js requires:
* 'cheerio', ('../logger').appLogger
*
* browser requires:
* jQuery
*
* notice that for cheerio: $(this) == this -> true
* but in jQuery the above result in false, this why you see the
* following at various places:
* var $this = $(this);
*/
'use strict';

//shared requires
var _         = require('lodash')
  , uuid      = require('node-uuid')
  , isBrowser = require('./utils').isBrowser()

  //to be set (if needed)
  , jQuery
  , cheerio
  , logger
  , getOuterHTML
  , getRootHTML
  , $ ;

//private function to initialize environment
(function configureEnv_(){
  //choose appropriate configuration
  isBrowser ? configure4Browser_() : configure4Node_();

})();

function configure4Node_(){
  //avoid browserify cause cheerio is incompatible
  // FIXME: keep an eye on cheerio for compatibility
  cheerio = eval('require(\'cheerio\')');
  // TODO: Allow logger argument
  // logger = require('../logger').appLogger;
  logger = console;

  getRootHTML = function($) {
    return $.html()
  };

  getOuterHTML = function($, $el) {
    return $.html($el)
  };
}

function configure4Browser_(){
  jQuery = require('jquery');
  logger = console;

  getRootHTML = function($) {
    return $('body').html();
  };

  getOuterHTML = function($, $el) {
    $($('<div></div>').html($el.clone())).html();
  };
}

var Parser = module.exports = function(){
  // default options for template names, selectors etc.
  this.defaultOptions={
    outputFormat            : 'Array',
    //TODO                  : test this
    defaultMultiChoiceInput : 'checkbox',
    questionSelectors       : {
      multiChoice : 'multi-choice',
      codeInput   : 'code-input',
      textInput   : 'text-input',
      highlight   : 'highlight'
    },
    exerciseClass           : 'asq-exercise',
    questionClass           : 'asq-question',
    rubricClass             : 'asq-rubric',
    inputTypeSelectors      : {
      'choose-1'   : 'radio' ,
      'choose-0-n' : 'checkbox',
      'choose-1-n' : 'checkbox'
    }
  };

  this.options = {};
  this.$       = null; // Placeholder for the DOM manipulation library
  this.errors  = [];   // Log all errors during parsing.
};


(function(){
  /**
   *  Parses HTML according to asq microformat
   *  @param {string} HTML The HTML string to parse. Useful only for server-side
   *    processing.
   *  @param {object} options
   *  @returns {object} the contains questions, stats and HTML. if any errors
   *    occurred, the return value is an an object with an 'errors' array
   **/
  this.parse = function(html, options) {

    //configure dom selector lib implementation
    $ = this.$ = isBrowser ? jQuery : cheerio.load(html);

    //argument overload
    options = options || {};

    // Support callback as second arg.
    if (typeof options === 'function') {
        callback = options;
        options  = {};
    }

    if(typeof options !== 'undefined' && typeof options !== 'function') {
      _.extend(this.options, this.defaultOptions, options);
    }

    var opts    = this.options
    , start     = new Date()
    , errors    = null
    , exercises = []
    , rubrics   = []
    , stats     = null
    , data      = null;

    // make sure every question belongs to an exercise
    var $questions = $('.' + opts.questionClass);

    $questions.filter(function checkForExercise(){
      return $(this).closest('.' + opts.exerciseClass).length === 0;
    }).each(function addExerciseParent(){

      var id = 'ex-' + uuid.v4();
      $(this)
        .before('<div class="' + opts.exerciseClass + '" id="'+ id +'"></div>');

      //prepend to exercise element after we remove it.
      // In jQuery there's no need to remove the node as it
      // would get moved for us. This is for cheerio.
      $('#' + id).prepend($(this).remove());
    });

    //parse exercices
    var $exercises = $('.' + opts.exerciseClass)
    $exercises.each((function(index, el){
      var exerciseData = this.parseExercise(index, el)
      exercises.push(exerciseData.exercise);
      rubrics.concat(exerciseData.rubrics); // rubrics of questions in exercise.
    }).bind(this))

    //stats parsing
    stats = this.parseStats($('.stats'));

    if(this.errors.length === 0) { // No errors during parsing
      data = {
        exercises: exercises,
        rubrics : rubrics,
        stats: stats,
        html: getRootHTML($)
      };
    } else {
      errors = this.errors;
    }
    return returnData(errors, data, logger, start);
  }

  /**
   *  Parse each question element. To be used in an '.each' jquery iterator
   *  Assumes 'this' bound to the parser
   **/
  this.parseExercise = function(index, el){
    var $el = $(el);
    if(! hasId($el)){
     this.pushError('found exercise without id');
     return false;
    }

    // check for double exercise ids
    if(hasDuplicateId($el)){
      this.pushError('Multiple IDs #'+$el.attr('id'))
      return false;
    }

    //parse questions
    var exQuestions = [];
    $el.find('.' + this.options.questionClass)
      .each((function(index, el){
        var newQuestion = this.parseQuestion(el);

      // if (this.options.outputFormat === 'Array') {
      //   questions.push(newQuestion);
      // } else {
      //   questions[$el.attr('id')] = newQuestion;
      // }
        exQuestions.push(newQuestion);
      }).bind(this));

    var rubrics = [];
    // Parsing rubric
    var $rubrics = $el.children('.asq-rubric');

    if ($rubrics.length > 0) {
      var i, max;
      for (i = 0, max = $rubrics.length; i < max; i++){
        var rubric = this.parseRubric($, $($rubrics[i]), question.htmlId);
        if (!! rubric) { // Otherwise the rubric is not valid and is ignored
          rubrics.push(rubric); // and an error has been logged.
        }
      }
    }

    var exercise = {
      htmlId: $el.attr('id'),
      questions: exQuestions
    }

    return { exercise : exercise, rubrics : rubrics };
  }

  this.parseStats = function($stats) {
    var stats = [];
    $stats.each(function(){
      var $this = $(this);
      stats.push({
        questionHtmlId  : $this.attr('data-target-assessment'),
        slideHtmlId     : $this.parents('.step').attr('id')
      });
    });
    return stats;
  }

  /*************
   * Questions *
   *************/

  /**
   *  Parse each question element.Assumes 'this' bound to the parser
   **/
  this.parseQuestion = function(el) {
    var $el = $(el)
      , opts = this.options;

    //check for empty ids
    if(! hasId($el)) {
      this.pushError('found question without id');
      return false;
    }

    // check for double question ids
    if(hasDuplicateId($el)){
      this.pushError('Multiple IDs #'+$el.attr('id'))
      return false;
    }

    // check for multiple question types
    var questionType = this.getQuestionType($el);
    if (! questionType) { // Something went wrong while getting the question
      return false;      // type. It's been handled, we just return false.
    }

    var question;
    switch(questionType) { //TODO: Switch !? Come on... we can do nicer than that!
      case opts.questionSelectors.codeInput :
        question = this.parseCodeInput($, $el, opts);
        break;

      case opts.questionSelectors.multiChoice :
        question = this.parseMultiChoice($, $el, opts);
        question.statTypes = ['correctness']; //Horrible hack to add correctness stats to MCQ...
        break;

      case opts.questionSelectors.textInput :
        question = this.parseTextInput($, $el, opts);
        break;
    }

    return question;
  }

  this.parseMultiChoice = function($, $el, opts) {
    //options for each question
    var questionOptions = []
    , opts              = this.options // TODO: Why do we have this!? (Fix it)
    , self              = this;

    //get options
    var choices = $el.children('ol.asq-options').children('li.asq-option');
    //console.log(choices);
    choices.each(function(){
      var $this = $(this);

      questionOptions.push({
        text: $this.html(),
        classList: $this.attr('class'),
        correct: $this.attr('data-correct') === 'true' ? true:false
      });
    });

    // find input types
    var inputType = this.getFormButtonType($el);
    if (inputType ===''){
      var optSels = opts.inputTypeSelectors;
      var validSelectors = optSels.sel1 + ' ' + optSels.sel0_n + ' ' + optSels.sel1_n ;
      self.pushError('No valid input type selectors for question. Valid types are: ' + validSelectors)
    }

    // find parent slide id
    var parentSlideId;
    var $slideParent = $el.parents('.step');
    if($slideParent.length>0){
      parentSlideId = $slideParent.attr('id') ? $slideParent.attr('id'):'';
    }

    var question = {
      stem : getOuterHTML($, $el.find('.stem')),
      stemText: $el.find('.stem').html(),
      htmlId: $el.attr('id'),
      slideHtmlId : parentSlideId,
      questionType: 'multi-choice',
      formButtonType : inputType,
      questionOptions : questionOptions
    };

    return question;
  }

  this.parseTextInput = function ($, $el, opts) {
    // find parent slide id
    var parentSlideId
      , $slideParent = $el.parents('.step');

    if($slideParent.length>0){
      parentSlideId = $slideParent.attr('id') ? $slideParent.attr('id'):'';
    }

    var $stem =$el.find('.stem')
      , answer = $stem.attr('data-correct-answer')
      , question = {
        stem : getOuterHTML($, $stem),
        stemText: $stem.html(),
        htmlId: $el.attr('id'),
        slideHtmlId : parentSlideId,
        questionType: 'text-input',
        correctAnswer : typeof answer== 'undefined' ? null : answer
      };

    return question;
  }

  this.parseCodeInput = function ($, $el, opts) {
    // find parent slide id
    var parentSlideId
      , $slideParent = $el.parents('.step');

    if($slideParent.length>0){
      parentSlideId = $slideParent.attr('id') ? $slideParent.attr('id'):'';
    }

    var $stem =$el.find('.stem')
      , answer = $stem.attr('data-correct-answer')
      , question = {
        stem : getOuterHTML($, $stem),
        stemText: $stem.html(),
        htmlId: $el.attr('id'),
        slideHtmlId : parentSlideId,
        questionType: 'code-input',
        correctAnswer : typeof answer === 'undefined' ? null : answer
      };

    return question;
  }

  /***********
   * Rubrics *
   ***********/

  /**
   *  Parse a rubric and return a JSON of the formated rubric.
   *  @param {Object} $rubric - jQuery node of the rubric to parse.
   **/
  this.parseRubric = function($, $rubric, questionId) {
    var self = this;

    // check for multiple question types
    var rubricType = self.getQuestionType($rubric);
    if (!rubricType) { // Something went wrong while getting the question
      return false;    // type. It's been handled, we just return false.
    }

    var rubric = {};
    rubric.questionType = rubricType;
    rubric.question     = questionId;

    //Stem
    var $stem = $rubric.find('.stem');
    rubric.stem     = getOuterHTML($, $stem);
    rubric.stemText = $stem.html();

    var questionTypes = this.options.questionSelectors;
    switch(rubricType) { //TODO: Switch !? Come on... we can do nicer than that!
      case questionTypes.codeInput :
        self.pushError('Code Input not implemented for rubrics (question ' +
          rubric.question +')');
        break;

      case questionTypes.multiChoice :
        self.parseMCQRubric($, $rubric, rubric);
        break;

      case questionTypes.textInput :
        self.pushError('Code Input not implemented for rubrics (question ' +
          rubric.question + ')');
        break;
    }

    return rubric;
  }

  this.parseMCQRubric = function($, $rubric, rubric) {
    var criteria = [];

    //criteria are list items with the option class
    var $criteria = $rubric.find('ol li.option') // TODO: prefix option with asq (also for standard questions)
    , i, max;
    var points = [];
    for (i = 0, max = $criteria.length; i < max; i++) {
      var $criterion = $($criteria[i]);
      var point = parseInt($criterion.attr('data-asq-rubric-points'));
      if (point !== 0 && ! point) { // Default point value from pos in list
        point = max - i;             // if unable to get from data attr.
      }
      points.push(point);
      // Label from data attr if given otherwise from points.
      var label =  $criterion.attr('data-asq-rubric-label') || '' + point;
      var desc  = $criterion.html(); //description
      criteria.push({
        points : point,
        label  : label,
        desc   : desc
      });
    }
    i = points.length;
    var positive = null;
    var maxScore = 0;
    while(i--) {
      if (points[i] === 0) {
        continue;
      } else if (positive === null) {
        positive = points[i] > 0;
        maxScore = positive ? points[i] : - points[i]
      } else if (positive && points[i] > 0) {
        maxScore += points[i];
      } else if (!positive && points[i] < 0) {
        maxScore -= points[i];
      } else {
        this.pushError('Mixed signs for criteria scores for rubric ' +
          rubric.stemText);
      }
    }

    rubric.criteria       = criteria;
    rubric.maxScore       = maxScore;
    rubric.formButtonType = this.getFormButtonType($rubric);
    rubric.statTypes      = ['rubric-mcq']; // Setting specific stats for rubrics
    return rubric;
  }

  /********************
   * Helper functions *
   ********************/

  /**
    *  Keep track of parsing errors
    *  @param {string} error - String describing the parsing error encountered.
    **/
  this.pushError = function(error) {
    this.errors.push(error);
  }

  /**
   * Return form input type based on first class found indicating such a type
   * @param {Object} $el - jQuery Object for which the input types needs to be determined.
   *
   * The input type is determined by the first valid class encountered.
   **/
  this.getFormButtonType = function ($el) {
    var i
    , hasOwn     = Object.prototype.hasOwnProperty
    , inputTypes = this.options.inputTypeSelectors;
    for (i in inputTypes) {
      if (hasOwn.call(inputTypes, i) && $el.hasClass(i)) {
        return inputTypes[i];
      }
    }
    return this.options.defaultMultiChoiceInput;

  }

  this.getQuestionType = function($el){
    var classes = []
      , opts = this.options;

    for (var key in opts.questionSelectors){
      if ($el.hasClass(opts.questionSelectors[key])){
        classes.push(opts.questionSelectors[key]);
      }
    }

    if(classes.length > 1) {
      this.pushError([
        'Multiple question types:', classes.toString(), 'for', $el.html()
      ].join(' '));
      return false;
    } else if(classes.length < 1) {
      this.pushError('No question type found for ' + $el.html())
      return false;
    } else {
      return classes[0];
    }
  }

}).call(Parser.prototype)

function hasId($el){
  return ('undefined' !== typeof $el.attr('id') && $el.attr('id').trim() !== '')
}

function hasDuplicateId($el){
  return ($('[id="'+ $el.attr('id')+'"]').length > 1);
}

// returns date either by callback or promise
// modified from from https://github.com/glennjones/microformat-node/
// half credit goes to Glenn Jones
function returnData(errors, data, logger, start){
  if (errors) {
  logger.error(JSON.stringify(errors));

  }
  if (start) {
    logger.info('ASQ parser took: ' + (new Date().getTime() - start.getTime()) + 'ms');
  }
  return errors
    ? {errors: errors}
    : data;
}
