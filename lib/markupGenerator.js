/** @module lib/asqAssessmentMarkupGenerator
    @description Parse HTML files to extract assessment information
*/

/*
* node.js requires:
* 'cheerio', ('../logger').appLogger, 'dustfs'
*
* browser requires:
* jQuery
*
*/
'use strict';

// ENV Confiugration and setup

var isBrowser = require('./utils').isBrowser()
//to be set (if needed)
, jQuery
, cheerio
, dust
, logger;

function configure4Node_(){
  //avoid browserify cause cheerio is incompatible
  // FIXME: keep an eye on cheerio for compatibility
  cheerio = eval('require(\'cheerio\')');

  //  TODO:: Allow logger argument
  // logger = require('../logger').appLogger;
  logger = console;
}

function configure4Browser_(){
  jQuery = require('jquery');
  logger = console;
  dust  =  require('../dusts/compiled/templates')(require('dustjs-linkedin'));
}

//private function to initialize environment
(function configureEnv_(){
  //choose appropriate configuration
  if (isBrowser) { configure4Browser_() } else { configure4Node_(); }
})();

// MODULE STARTS HERE

var when         = require('when')
, _              = require('lodash')
, blacklistRegex = new RegExp(require('./scriptBlacklist').join('|'), 'i');

var MarkupGenerator = module.exports = function(dustInstance){
  this.defaultOptions = {
    mode : 'normal',
    userType: '',
    outputFormat : 'Array',
    templates : {
      'exercise' : {
        'presenter' : 'exercise-presenter',
        'viewer'    : 'exercise-viewer'
      },
      'code-input' : {
        'presenter' : 'question-code-input-presenter',
        'viewer'    : 'question-code-input-viewer'
      },
      'asq-css-select' : {
        'presenter' : 'question-asq-css-select-presenter',
        'viewer'    : 'question-asq-css-select-viewer'
      },
      'asq-js-function-body' : {
        'presenter' : 'question-asq-js-function-body-presenter',
        'viewer'    : 'question-asq-js-function-body-viewer'
      },
      'multi-choice' : {
        'presenter' : 'question-multi-choice-presenter',
        'viewer'    : 'question-multi-choice-viewer'
      },
      'text-input' : {
        'presenter' : 'question-text-input-presenter',
        'viewer'    : 'question-text-input-viewer'
      },
      'stats':  {
        'presenter' : 'stats',
        'viewer'    : 'answer',
      },
      'welcome-screen' : {
        'presenter' : 'welcomeScreen-presenter',
        'viewer'    : 'welcomeScreen-viewer'
      },
      'modal' : {
        'presenter' : 'modal',
        'viewer'    : 'modal'
      }
    },
    supportedPanes : {  // Supported Panes for graphs
      'correct'          : false,
      'distinct-options' : false,
      'distinct-answers' : false,
      'right-vs-wrong'   : false,
      'correctness'      : false
    }
  };

  this.dust = dustInstance || dust
  require('../dusts/compiled/templates')(this.dust);
  this.options = {};
};

// default options for template names, selectors etc.

(function(){
  this.render = function(html, exercises, rubrics, options){
    var  deferred = when.defer();


    if(typeof options !== 'undefined'){
      _.extend(this.options, this.defaultOptions, options);
    }else{
      process.nextTick(function(){
        deferred.reject(new Error(
          'You need to specify at least the userType in options'));
        return deferred.promise;
      });
    }

    var opts = this.options;
    this.statId = 0; // reset statId counter

    // generation starts from root node. we wrap everything
    // in a div so that we can use 'children" functions for
    // the root as well
    var wrappedHtml = '<div>' + html + '</div>'

    //setup dom manipulation
    var $ = isBrowser ? jQuery : cheerio.load(wrappedHtml, {decodeEntities: false})
      , $root = isBrowser ? $(wrappedHtml) : $('div').eq(0);

    // // NOTE: no need to wrap the html here, it is done during parsing.
    // //setup dom manipulation
    // var $ = isBrowser ? jQuery : cheerio.load(html)
    //   , $root = isBrowser ? $(html) : $($.root()[0]);

    if (typeof opts.userType === 'undefined') {
      process.nextTick(function(){
        deferred.reject(new Error('options.userType is missing'));
      });
    } else if (['presenter','viewer'].indexOf(opts.userType) === -1) {
      process.nextTick(function(){
        deferred.reject(new Error('options.userType with invalid value'));
      });
    }else{
      this.renderAll.call(this, $, $root, exercises).then(function renderedFinished() {
        deferred.resolve($root.html());
      })
      .catch(function(err){
        deferred.reject(err);
      });
    }
    return deferred.promise;
  }

  this.renderAll = function($, $root, exercises) {
    var self = this;
    var userType = this.options.userType
    , deferreds  = [];

      if(this.options.mode === 'preview'){
        $('.asq-welcome-screen').each(function(index, el) {
          deferreds.push(this.renderWelcome($(el), {
            presenterLiveUrl: 'http://myserver:3000/myname/live'
          }));
        }.bind(this));
      } else { // inject welcome-screen dust
        $('.asq-welcome-screen').html('{>"' +
          this.options.templates['welcome-screen'][userType] + '"/}');
      }

      // render exercises
      return when.map(exercises, function handleExercise(exercise) {
        return this.renderExercise($root, exercise).then(function handleQuestion() {
          return this.renderQuestions.call(this, $root, exercise.questions);
        }.bind(this));
      }.bind(this))/*.then(function handleModal() {
        //check if we have elements that need a modal (rubrics for now)
        // check if there's a body
        // check if there's a modal option
        return self.renderModal($);
      })*/.then(function wrapUpRendering() {
        if(self.options.mode !== 'preview'){
          //inject dust vars for socket params in body data attrs
          $('body').attr('data-asq-host', '{host}');
          $('body').attr('data-asq-port', '{port}');
          $('body').attr('data-asq-session-id', '{id}');
          $('body').attr('data-asq-socket-mode', '{mode}');
          $('body').attr('data-asq-socket-token', '{token}');
          $('body').attr('data-asq-user-session-id', '{userSessionId}');


          //remove black-listed scripts
          $('script').each(function(){
            var src = $(this).attr('src')
            if (src && src.match(blacklistRegex)){
               $(this).remove();
            }
          })

          //include presenter or viewer script
          var asqScript = '/js/asq-' + userType + '.js';

          $('script[src$="impress.js"]')
            //first add vendor scripts
            .before('<script src="/js/asq-vendor-presentation.js"></script>')
            //and then replace impress with asqScript
            .attr('src', asqScript );

          // $('head').append('<link href="/css/bootstrap.min.css" rel="stylesheet">');
        }

      }).catch(function(error){
        throw error;
      });
  }

  this.renderWelcome = function($welcomeEl, data){
    var deferred = when.defer();
    this.dust.render(
      this.options.templates['welcome-screen'][this.options.userType], data,
      function onRenderWelcome(err, out) {
        if (err) {
          process.nextTick(function onWelcomeRenderError() {
            deferred.reject(err);
          });
          return;
        }
        $welcomeEl.html(out);
        deferred.resolve(out);
    });
    return deferred.promise;
  }

  this.renderModal = function($) {
    var deferred = when.defer();
    this.dust.render(this.options.templates['modal'][this.options.userType], {},
      function onModalRender(err, out) {
        if (err) {
          process.nextTick(function onModalRenderError() {
            deferred.reject(err);
          });
          return;
        }
        //  $('body').append(out);
        deferred.resolve($root);
      });
    return deferred.promise;
  }

  this.renderExercise = function($root, exercise){
    var deferred = when.defer();
    var $el = $root.find('#' +  exercise.htmlId);
    var template = this.options.templates.exercise[this.options.userType];

    if('undefined' === typeof template){
      deferred.reject(new Error('Invalid template'));
    }
    exercise.exerciseContent = $el.html()
    exercise.self = exercise.assessmentTypes.indexOf('self') > -1;
    exercise.peer = exercise.assessmentTypes.indexOf('peer') > -1;
    //render preserving content
    this.dust.render(template, exercise, function onExRender(err, out) {
      if(err) {
        process.nextTick(function(){
          deferred.reject(err);
        });
        return;
      }

      $el.attr('data-asq-exercise-id', exercise.id);
      $el.html(out); // Replacing exercise content
      deferred.resolve($root);
    });

    return deferred.promise;
  }

  this.renderQuestions = function($root, questions){
    return when.map(questions, (function(question){
      return this.renderQuestion.call(this, $root, question)
        .then(function(renderedQuestion){
          return this.renderStats.call(this, $root, question);
        }.bind(this))
     }).bind(this))
  }

  this.renderQuestion = function($root, question){
    var userType = this.options.userType
      , $el = $root.find('#' + question.htmlId)
      , deferred = when.defer()
      , template = 'question-' + userType;

    this.dust.render(template, question, function(err, out) {
      if(err) {
        process.nextTick(function onRenderError() {
          deferred.reject(err);
        });
        return;
      }

      $el.attr('data-question-id', question.id);
      $el.html(out); // Replacing question content
      $el.siblings('.asq-rubric').remove(); // Removing rubric html
      deferred.resolve($root);
    });

    return deferred.promise;
  }

  //render stats or answers
  this.renderStats = function($root, question){
    var self = this;
    var selector = '.asq-stats[data-target-asq-question="' + question.htmlId + '"]'
    return when.map($root.find(selector), function assessmentRender(stat){
      var  $stat = $root.find(selector);

      // Set up margins and size for d3.js placeholder.
      var margin = self.setUpStatsPlaceHolder($stat, $stat.attr('data-margin'));

      // Set up panes displaying specific stats.
      var activePanes = self.setUpActivatedPanes($stat, self.options.supportedPanes);

      return self.renderStat.call(self, $stat, {
        question    : question,
        statId      : ++self.statId,
        activePanes : activePanes,
        width       : 879,
        height      : 500,
        margin      : JSON.stringify(margin)
      });
    });
  }

  this.renderStat = function($stat, data){
    var deferred = when.defer()
    , userType   = this.options.userType;
    this.dust.render(this.options.templates.stats[userType], data,
      function onRenderStat(err, out) {

      if(err) {
        process.nextTick(function onStatRenderError() {
          deferred.reject(err);
        });
        return;
      }

      $stat.html(out);
      $stat.attr('data-target-asq-question-id', data.question.id);
      deferred.resolve($stat);
    });
    return deferred.promise;
  }

  this.setUpStatsPlaceHolder = function ($stat, margin) {
    if (! _.isPlainObject(margin)) {
        margin = {};
      }
    if (! _.has(margin, 'top'))    { margin.top    = 60; }
    if (! _.has(margin, 'bottom')) { margin.bottom = 60; }
    if (! _.has(margin, 'right'))  { margin.right  = 40; }
    if (! _.has(margin, 'left'))   { margin.left   = 120; }

    var width = $stat.attr('data-width') || 879;
    var height = $stat.attr('data-height') || 500;
    $stat.removeAttr('data-margin');
    $stat.removeAttr('data-width');
    $stat.removeAttr('data-height');

    return margin;
  }

  this.setUpActivatedPanes = function($stat, activePanes) {
    // Indicate which panels to include in the template
    var dataPanesAttr = $stat.attr('data-panes') || '';
    dataPanesAttr = dataPanesAttr.toLowerCase().replace(/\s/g,'');
    if (dataPanesAttr !== '' && dataPanesAttr !== 'all') {
      var panelNames = dataPanesAttr.split(',');
      var i = panelNames.length, pane;
      while(i--) {
        pane = panelNames[i];
        if (activePanes.hasOwnProperty(pane)) { activePanes[pane] = true; }
      }
    } else { // Default panels to include
      activePanes = {
        'correct'          : false,
        'distinct-options' : false,
        'distinct-answers' : false,
        'right-vs-wrong'   : false,
        'correctness'      : true
      };
    }
    return activePanes;
  }
}).call(MarkupGenerator.prototype);
