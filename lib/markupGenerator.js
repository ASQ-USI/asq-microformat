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

var when    = require('when')
  , _         = require('lodash')
  , isBrowser = require('./utils').isBrowser()

  //to be set (if needed)
  , jQuery
  , cheerio
  , dust
  , logger
  , getRootHTML ;

//private function to initialize environment
(function configureEnv_(){
  //choose appropriate configuration
  isBrowser ? configure4Browser_() : configure4Node_();
})();

function configure4Node_(){
  //avoid browserify cause cheerio is incompatible
  // FIXME: keep an eye on cheerio for compatibility
  cheerio = eval("require('cheerio')");
  
  //  TODO:: Allow logger argument
  // logger = require('../logger').appLogger;
  logger = console;
  dust  = require('dustjs-linkedin')

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

var MarkupGenerator = module.exports = function(){
  this.defaultOptions={
    mode : "normal",
    userType: "",
    outputFormat : 'Array',    
    templates : {
      'code-input' : {
       'presenter' : 'questionCodeInput',
       'viewer' : 'questionCodeInput'
      },
      'multi-choice' : {
        'presenter' : 'questionList-presenter',
        'viewer' : 'questionList-viewer' 
      },
      'text-input' : {
       'presenter' : 'questionTextInput',
       'viewer' : 'questionTextInput'
      },
      'stats':  {
        'presenter' : 'stats',
        'viewer'  : 'answer',
      },      
      'welcome-screen' : {
        'presenter' : 'welcomeScreen-presenter',
        'viewer' : 'welcomeScreen-viewer' 
      }
    }
  };

  //placeholder for the dom manipulation library
  this.$ = null;
  this.options = {};
};

// default options for template names, selectors etc.

(function(){
  this.renderOne = function($el, question, userType){
    var deferred = when.defer();
    var self =this;

    var template = this.defaultOptions.templates[question.questionType][userType]
    if(template === undefined){
      deferred.reject(new Error('Invalid template'));
    }
    // TODO: AWFUL including each time! Find solution
    //require('../dusts/compiled/templates')();
    dust.render(template, {question:question, userType:userType}, function(err, out) {
      if(err) {
        process.nextTick(function(){
          deferred.reject(err);
        })
        return;        
      }

      $el.attr('question-id', question.id);
      $el.find('ol').remove();
      $el.find('.stem').after(out);
      deferred.resolve(out);
    });

    return deferred.promise;
  }

  this.renderStat = function($stat, data, userType){
    var deferred = when.defer();

   // TODO: AWFUL including each time! Find solution
    //require('../dusts/compiled/templates')();

    dust.render(this.defaultOptions.templates.stats[userType], data, function(err, out) {
      if(err) {
        process.nextTick(function(){
          deferred.reject(err);
        }); 
        return;
      }
      $stat.html(out);
      $stat.attr('target-assessment-id', data.question.id);
      deferred.resolve(out);
    });
    return deferred.promise;
  }

  this.renderWelcome = function($welcomeEl, data, userType){
    var deferred = when.defer();
     // TODO: AWFUL including each time! Find solution
    //require('../dusts/compiled/templates')();
    dust.render(this.defaultOptions.templates['welcome-screen'][userType], data, function(err, out) {
      if(err) {
        process.nextTick(function(){
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
      var self = this
        , $ = self.$
        , deferreds = [];

      process.nextTick(function(){

        if(self.options.mode === "preview"){
           $('.asq-welcome-screen').each(function(){
             deferreds.push(self.renderWelcome($(this),
                            { presenterLiveUrl: "http://myserver:3000/myname/live" },
                            userType));
           })
        }else{
          //inject welcome-screen dust
          $('.asq-welcome-screen').html('{>"'+ self.defaultOptions.templates['welcome-screen'][userType]+'"/}')
        }

        var statId =0;
        // render questions
        _.each(questions, function(question){
          //render question
          deferreds.push(self.renderOne.call(self,$('#' + question.htmlId), question, userType));

          //render stats or answers
          _.each($('.stats[data-target-assessment="' +question.htmlId+ '"]'), function(stat){

            var activePanes = {
              "correct": false,
              "distinct-options": false,
              "distinct-answers": false,
              "right-vs-wrong":false,
              "correctness":false
            }

            var dataPanelsAttr = $(stat).attr('data-panes')
            dataPanelsAttr = dataPanelsAttr ? dataPanelsAttr.toLowerCase().replace(/ /g,'') : ''
            if(dataPanelsAttr !== '' && dataPanelsAttr !== 'all'){
              var panelNames = dataPanelsAttr.split(',')

              panelNames.forEach( function(el,index){
                if(activePanes.hasOwnProperty(el)){
                  activePanes[el] = true;
                }                
              })

            }else{
              activePanes= { "correct": true,
              "distinct-options": true,
              "distinct-answers": true,
              "right-vs-wrong":true,
              "correctness":false
              }
            }

            deferreds.push(self.renderStat.call(self, $(stat), {
              question: question, 
              statId: ++statId, 
              activePanes: activePanes
            }, userType));
          });
        })

        //inject dust vars for socket params in body data attrs
        $('body').attr('asq-host', '{host}')
        $('body').attr('asq-port', '{port}')
        $('body').attr('asq-session-id', '{id}')
        $('body').attr('asq-socket-mode', '{mode}');


        //if presenter render stat slides
        if(userType === "presenter"){
          //add presenter scripts       
          $('script[src$="impress.js"]')
            .attr('src', "/js/asq-presenter.js" )

        }else{ //we are not admin so render answer slides

            //add viewer scripts
          $('script[src$="impress.js"]')
            .attr('src', "/js/asq-viewer.js" )
        }

      })
      
    return when.all(deferreds).then(function(){
      var deferred = when.defer();
      process.nextTick(function(){
        deferred.resolve(self.$)
      })
       return deferred.promise
     });

  }

  this.render = function(html, questions, options){
    var  deferred = when.defer()
      , self=this
      , $ = self.$ = isBrowser ? jQuery : cheerio.load(html);

    if(typeof options !== "undefined"){
      _.extend(this.options, this.defaultOptions, options);
    }else{
      process.nextTick(function(){
        deferred.reject(new Error('You need to specify at least the userType in options'))
      });
    }

    var opts = this.options;

    if(typeof opts.userType ==' undefined' 
        || ['presenter','viewer'].indexOf(opts.userType)==-1) {
      process.nextTick(function(){
        deferred.reject(new Error('options.userType is missing, or invalid value'))
      });
    }

    this.renderAll(questions, opts.userType).then(function($$){
     // console.log(getRootHTML($$))
      deferred.resolve(getRootHTML($$));
    },
    function(err){
      deferred.reject(err);
    })

    return deferred.promise;
  }
}).call(MarkupGenerator.prototype);