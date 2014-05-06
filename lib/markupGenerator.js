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
, logger
, getRootHTML;

function configure4Node_(){
  //avoid browserify cause cheerio is incompatible
  // FIXME: keep an eye on cheerio for compatibility
  cheerio = eval('require(\'cheerio\')');

  //  TODO:: Allow logger argument
  // logger = require('../logger').appLogger;
  logger = console;

  getRootHTML = function($) {
    return $.html()
  };
}

function configure4Browser_(){
  jQuery = require('jquery');
  logger = console;
  dust  =  require('../dusts/compiled/templates')(require('dustjs-linkedin'));
  getRootHTML = function($) {
    return $('body').html();
  };
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
      'code-input' : {
        'presenter' : 'questionCodeInput',
        'viewer'    : 'questionCodeInput'
      },
      'multi-choice' : {
        'presenter' : 'questionList-presenter',
        'viewer'    : 'questionList-viewer'
      },
      'text-input' : {
        'presenter' : 'questionTextInput',
        'viewer'    : 'questionTextInput'
      },
      'stats':  {
        'presenter' : 'stats',
        'viewer'    : 'answer',
      },
      'welcome-screen' : {
        'presenter' : 'welcomeScreen-presenter',
        'viewer'    : 'welcomeScreen-viewer'
      }
    }
  };

  this.dust = dustInstance || dust
  //placeholder for the dom manipulation library
  this.$ = null;
  this.options = {};
};

// default options for template names, selectors etc.

(function() {
  this.renderOne = function($el, question, userType) {
    var deferred = when.defer();
    var self     = this;
    var template =
      this.defaultOptions.templates[question.questionType][userType];

    if(template === undefined) {
      deferred.reject(new Error('Invalid template'));
    }

    this.dust.render(template, {
      question : question,
      userType : userType
    }, function(err, out) {
      if(err) {
        process.nextTick(function onRenderError() {
          deferred.reject(err);
        });
        return;
      }

      $el.attr('question-id', question.id);
      $el.children('.options').html(out);   // Replacing question content
      $el.children('.asq-rubric').remove(); // Removing rubric html
      deferred.resolve(out);
    });

    return deferred.promise;
  }

  this.renderStat = function($stat, data, userType) {
    var deferred = when.defer();
    this.dust.render(this.defaultOptions.templates.stats[userType], data,
      function onRenderStat(err, out) {

      if(err) {
        process.nextTick(function onStatRenderError() {
          deferred.reject(err);
        });
        return;
      }
      $stat.html(out);
      $stat.attr('data-target-assessment-id', data.question.id);
      deferred.resolve(out);
    });
    return deferred.promise;
  }

  this.renderWelcome = function($welcomeEl, data, userType){
    var deferred = when.defer();
    this.dust.render(this.defaultOptions.templates['welcome-screen'][userType],
      data, function onRenderWelcome(err, out) {

      if(err) {
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

  this.renderAll = function(questions, userType){
    var self    = this
    , $         = self.$
    , deferreds = [];

    process.nextTick(function() {

      if (self.options.mode === 'preview') {
        $('.asq-welcome-screen').each(function() {
          deferreds.push(
            self.renderWelcome($(this),
            { presenterLiveUrl: 'http://myserver:3000/myname/live' },
            userType));
         });
      } else {
        //inject welcome-screen dust
        $('.asq-welcome-screen').html(['{>"',
          self.defaultOptions.templates['welcome-screen'][userType], '"/}'
        ].join(''));
      }

      var statId = 0;
      // render questions
      _.each(questions, function(question) {
        //render question
        deferreds.push(self.renderOne.call(self, $('#' + question.htmlId),
          question, userType));

        //render stats or answers
        _.each($('.stats[data-target-assessment="' + question.htmlId + '"]'),
          function assessmentRender(stat) {

          var activePanes = {
            'correct'          : false,
            'distinct-options' : false,
            'distinct-answers' : false,
            'right-vs-wrong'   : false,
            'correctness'      : false
          }

          // Handling margins and size for stats
          var margin = $(stat).attr('data-margin');
          if (! _.isPlainObject(margin)) {
            margin = {};
          }
          if (! _.has(margin, 'top'))    { margin.top    = 60; }
          if (! _.has(margin, 'bottom')) { margin.bottom = 60; }
          if (! _.has(margin, 'right'))  { margin.right  = 40; }
          if (! _.has(margin, 'left'))   { margin.left   = 120; }
          var width = $(stat).attr('data-width') || 879;
          var height = $(stat).attr('data-height') || 500;
          $(stat).removeAttr('data-margin');
          $(stat).removeAttr('data-width');
          $(stat).removeAttr('data-height');

          var dataPanelsAttr = $(stat).attr('data-panes')
          dataPanelsAttr = dataPanelsAttr
            ? dataPanelsAttr.toLowerCase().replace(/ /g,'')
            : '';
          if (dataPanelsAttr !== '' && dataPanelsAttr !== 'all') {
            var panelNames = dataPanelsAttr.split(',');

            panelNames.forEach( function(el,index){
              if(activePanes.hasOwnProperty(el)){
                activePanes[el] = true;
              }
            })

          } else {
            activePanes = {
              'correct'          : true,
              'distinct-options' : true,
              'distinct-answers' : true,
              'right-vs-wrong'   : true,
              'correctness'      : true };
          }

          // console.log(activePanes);

          deferreds.push(self.renderStat.call(self, $(stat), {
            question    : question,
            statId      : ++statId,
            activePanes : activePanes,
            width       : width,
            height      : height,
            margin      : margin
          }, userType));
        });
      });

      //inject dust vars for socket params in body data attrs
      $('body').attr('asq-host', '{host}')
      $('body').attr('asq-port', '{port}')
      $('body').attr('asq-session-id', '{id}')
      $('body').attr('asq-socket-mode', '{mode}');


      //remove black-listed scripts
      $('script').each(function() {
        var src = $(this).attr('src')
        if (src && src.match(blacklistRegex)) {
           $(this).remove();
        }
      });


      //include presenter or viewer script
      var asqScript = userType === 'presenter'
        ? '/js/asq-presenter.js'
        : '/js/asq-viewer.js';

      $('script[src$="impress.js"]')
        //first add vendor scripts
        .before('<script src="/js/asq-vendor-presentation.js"></script>')
        //and then replace impress with asqScript
        .attr('src', asqScript );

    });

    return when.all(deferreds).then(function() {
      var deferred = when.defer();
      process.nextTick(function() { deferred.resolve(self.$); });
      return deferred.promise;
    });

  }

  this.render = function(html, questions, rubrics, options){
    var  deferred = when.defer()
      , self=this
      , $ = self.$ = isBrowser ? jQuery : cheerio.load(html);

    if (typeof options === 'undefined') {
      process.nextTick(function onUndefined() {
        deferred.reject(
          new Error('You need to specify at least the userType in options'));
        return;
      });
    }

    _.extend(this.options, this.defaultOptions, options);

    var opts = this.options;

    if (typeof opts.userType === 'undefined'
        || ['presenter','viewer'].indexOf(opts.userType) === -1) {
      process.nextTick(function onUndefUser() {
        deferred.reject(
          new Error('options.userType is missing, or invalid value'));
      });
    }

    this.renderAll(questions, opts.userType).then(function onRender($$) {
      deferred.resolve(getRootHTML($$));
    },
    function onRenderError(err){
      deferred.reject(err);
    })

    return deferred.promise;
  }
}).call(MarkupGenerator.prototype);