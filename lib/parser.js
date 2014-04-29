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
var when      = require('when')
  , _         = require('lodash')
  , isBrowser = require('./utils').isBrowser()

  //to be set (if needed)
  , jQuery
  , cheerio
  , logger
  , getOuterHTML ;

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


  getOuterHTML = function($, $el) {
    return $.html($el)
  };
}

function configure4Browser_(){
  $ = jQuery = require('jquery');
  logger = console;

  getOuterHTML = function($, $el) {
    $($('<div></div>').html($el.clone())).html();
  };
}

var Parser = module.exports = function(){
  // default options for template names, selectors etc.
  this.defaultOptions={
    outputFormat : 'Array',
    //TODO: test this
    defaultMultiChoiceInput: 'checkbox',
    questionSelectors: {
      multiChoice : 'multi-choice',
      codeInput : 'code-input',
      textInput : 'text-input',
      highlight : 'highlight'
    },
    inputTypeSelectors: {
      'choose-1'   : 'radio' ,
      'choose-0-n' : 'checkbox',
      'choose-1-n' : 'checkbox'
    }
  };

  this.options={};
  //placeholder for the dom manipulation library
  this.$ = null;
  // Log all erros during parsing.
  this.errors = [];
};


(function(){

  // input types are determined by the last encountered
  // valid class name
  this.findFormInputType = function (classList){
    var formButtonType = ''
      , opts = this.options
      , classArray = classList.split(/\s+/);

      for (var i in classArray) {
        if (classArray[i] === opts.inputTypeSelectors.sel1) {
           formButtonType = 'radio';
        }
        else if ((classArray[i] === opts.inputTypeSelectors.sel0_n) || (classArray[i] === opts.inputTypeSelectors.sel1_n)){
          formButtonType = 'checkbox';
        }
        else{
          formButtonType = opts.defaultMultiChoiceInput;
        }
      }
    return(formButtonType)
  }

  // return form input type based on first class found indicating such a type
  this.getFormButtonType = function ($el) {
    console.log($el.attr('class'));
    var i
    , hasOwn     = Object.prototype.hasOwnProperty
    , inputTypes = this.options.inputTypeSelectors;
    for (i in inputTypes) {
      console.log('checking for', i);
      if (hasOwn.call(inputTypes, i) && $el.hasClass(i)) {
        console.log('FOUND', i, 'RETURNING', inputTypes[i]);
        return inputTypes[i];
      }
    }
    console.log('DEFAULT', this.options.defaultMultiChoiceInput);
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

  this.parseMultiChoice = function($, $el, opts) {
    //options for each question
    var questionOptions = []
    , opts              = this.options // TODO: Why do we have this!? (Fix it)
    , self              = this;

    //get options
    $el.find('li').each(function(){
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

  this.parseMCQRubric = function($, $rubric, rubric) {
    var criteria = [];

    //criteria are list items with the option class
    var $criteria = $rubric.find('ol li.option') // TODO: prefix option with asq (also for standard questions)
    , i, max;
    for (i = 0, max = $criteria.length; i < max; i++) {
      var $criterion = $($criteria[i]);
      var points = parseInt($criterion.attr('data-asq-rubric-points'));
      if (points !== 0 && ! points) { // Default point value from pos in list
        points = max - i;             // if unable to get from data attr.
      }
      // Label from data attr if given otherwise from points.
      var label =  $criterion.attr('data-asq-rubric-label') || '' + points;
      var desc  = $criterion.html(); //description
      criteria.push({
        points : points,
        label  : label,
        desc   : desc
      });
    }

    rubric.criteria       = criteria;
    rubric.formButtonType = this.getFormButtonType($rubric);
    rubric.statTypes      = ['rubric-mcq']; // Setting specific stats for rubrics
    return rubric;
  }

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


  // search for selector starting from root
  // module.exports.findFromRoot = function($el, selector) {
  //  console.log($el.find(selector))
  //  // return $el.filter(selector).add($el.find(selector));
  // }

  this.parse = function(html, options, callback){

    //configure dom selector lib implementation
    var $ = this.$ = isBrowser ? jQuery : cheerio.load(html);

    //argument overload
    options = options==undefined? {} : options;

    // Support callback as second arg.
    if (typeof options === 'function') {
        callback = options;
        options  = {};
    }

    if(typeof options !== 'undefined' && typeof options != 'Function') {
      _.extend(this.options, this.defaultOptions, options);
    }

    var opts= this.options;

    var deferred = when.defer()
    , start      = new Date()
    , questions  = opts.outputFormat === 'Array'? [] : {}
    , stats      = []
    , data       = null;


    // assessments parsing
    var $assessment = $('.assessment')
    , self          = this;

    // filter already processed elements
    $assessment.filter(function filterProcessed() {
      return $(this).find('form').length === 0;
    }).each( //Parse each assessment
      function parseAssessment() {
        var $this = $(this);

        //check for empty ids
        if($this.attr('id') === undefined || $this.attr('id').trim() === '') {
          self.pushError('found question without id');
          //TODO: try 5 times to assign a random id
          // the following code tries to assign a random id. For now disabled
          // because we have to see if we will save the html file.
          /*for (var i=0; i<5; i++){
            newId = 'question-' + Math.floor( Math.random()*999999 );
            if( $('#'+newId).length == 0){
              $this.attr('id',newId);
              console.log('Assigned id: ' + newId);
              break;
            }else if(i==4){
              errors = [{'error':  'Failed to assign newId'}]

              //break .each()
              return false;

            }
          }*/
        }

        // check for double question ids
        var ids = $('.assessment[id="'+ $this.attr('id')+'"]');
        if(ids.length > 1) {
          self.pushError('Multiple IDs #'+$this.attr('id'))
          return false;
        }

        // check for multiple question types
        var questionType = self.getQuestionType($this);
        if (! questionType) { // Something went wrong while getting the question
          return false;      // type. It's been handled, we just return false.
        }

        var question;
        switch(questionType) { //TODO: Switch !? Come on... we can do nicer than that!
          case opts.questionSelectors.codeInput :
            question = self.parseCodeInput($, $this, opts);
            break;

          case opts.questionSelectors.multiChoice :
            question = self.parseMultiChoice($, $this, opts);
            question.statTypes = ['correctness']; //Horrible hack to add correctness stats to MCQ...
            break;

          case opts.questionSelectors.textInput :
            question = self.parseTextInput($, $this, opts);
            break;
        }

        // Parsing rubric
        var $rubrics = $this.children('.asq-rubric');

        if ($rubrics.length > 0) {
          question.rubrics = [];
          var i, max;
          for (i = 0, max = $rubrics.length; i < max; i++){
            var rubric = self.parseRubric($, $($rubrics[i]), question.htmlId);
            if (!! rubric) { // Otherwise the rubric is not valid and is ignored
              question.rubrics.push(rubric); // and an error has been logged.
            }
          }
        } else { // No rubrics for that question
          question.rubrics = null;
        }

        console.log(question);

        if (opts.outputFormat === 'Array') {
          questions.push(question);
        } else {
          questions[$this.attr('id')] = question;
        }
    });

    //stats parsing
    $('.stats').each(function(){
      var $this = $(this);
      stats.push({
        questionHtmlId  : $this.attr('data-target-assessment'),
        slideHtmlId     : $this.parents('.step').attr('id')
      });
    })

    if(self.errors.length === 0) { // No errros during parsing
      data = { questions: questions, stats: stats };
    }

    var errors = self.errors.length === 0 // Set errors to null if there are
      ? null                              // no errors.
      : self.errors;
    returnData(errors, data, callback, deferred, logger, start);
    return deferred.promise;
  }

  // instantiates error array if not instantiated
  // and pushes the error
  this.pushError = function(error) {
    this.errors.push(error);
  }

}).call(Parser.prototype)

// returns date either by callback or promise
// copied from https://github.com/glennjones/microformat-node/
// full credit goes to Glenn Jones
function returnData(errors, data, callback, deferred, logger, start){
  if (errors) {
   logger.error(JSON.stringify(errors));
  }
  if (start) {
    logger.info('ASQ parser took: ' + (new Date().getTime() - start.getTime()) + 'ms');
  }
  if (callback && (typeof(callback) === 'function')) {
    callback(errors, data);
  } else if (errors) {
    deferred.reject(errors);
  } else {
    deferred.resolve(data);
  }
}