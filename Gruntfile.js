/**
  @fileoverview main Grunt task file
**/
'use strict';

var fs = require("fs")
  , path = require("path");

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    //browserify task
    browserify: {
      dist:{
        src: ['previewer/asq.js'],
        dest: 'dist/asq.js',
        options: {
          debug: true,
          alias: 'previewer/asq.js:asq,previewer/dust-runtime.js:dust' 
          ,
          external: ["cheerio","./dustfs", "../logger"],
        }        
      }
    },

    //dust task
    dust: {
      dist: {
        files: {
          "dusts/compiled/templates.js": "dusts/**/*.dust"
        },
        options: {
          basePath: "dusts/" ,
          wrapper: "commonjs",
          wrapperOptions: {
            deps: {
              dust: "dustjs-linkedin"
            }
          },
          runtime: false
        }
      }
    },

    //uglify task
    uglify: {
      options: {
        screw_ie8 : true,
        mangle:false,
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      dist: {
        files: {
          'dist/asq.min.js' : ['dist/asq.js'],
        }
      }
    },

        //watch
    watch: {
      defaults: {
        files: ['lib/**/*.js', 'dusts/*.dust', 'previewer/*.js'],
        tasks: ['build'],
        options: {
          interrupt: true
        },
      }
    }

  });
  
  //npm tasks
  require('load-grunt-tasks')(grunt);

  // Build grunt
  grunt.registerTask( "build", [ "dust", "browserify", "uglify" ] );
  // Default grunt
  grunt.registerTask( "default", [ "build"] );
  // Dev grunt
  grunt.registerTask( "devwatch", [ "dust", "browserify", "watch"] );
};
