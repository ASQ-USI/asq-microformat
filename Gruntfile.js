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
      previewer:{
        src: ['previewer/asq.js'],
        dest: 'dist/asq.js',
        options: {
          debug: true,
          alias: ['previewer/asq.js:asq',
                  'previewer/dust-runtime.js:dust']
          ,
          external: ["cheerio","./dustfs", "../logger"],
        }        
      },
      microformat:{
        src: ['index.js'],
        dest: 'dist/asq-microformat.js',
        options: {
          debug: true,
          alias: ['./index.js:asq-microformat',
                  'previewer/dust-runtime.js:dust'] 
          ,
          external: ["cheerio","./dustfs", "../logger"],
        }        
      },
      editor:{
        src: ['docs/js/asq-microformat-editor.js'],
        dest: 'dist/asq-microformat-editor.js',
        options: {
          debug: true,
          alias: ['docs/js/asq-microformat-editor.js:asq-microformat-editor']
        }        
      },
    },

    //dust task
    dust: {
      doc: {
        files: {
          "docs/doc-templates.js" : "docs/**/*.dust"
        },
        options:{
          basePath: "docs/",
          wrapper: "commonjs",
          runtime: false
        }
      },
      dist: {
        files: {
          "dusts/compiled/templates.js": "dusts/**/*.dust"
        },
        options: {
          basePath: "dusts/" ,
          wrapper: "commonjs",
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

    //less task
    less: {
      development: {
        options: {
          paths: ["docs/less"]
        },
        files: {
          "docs/css/asq-default-theme.css": "docs/less/asq-default-theme.less",
          "docs/css/renderer.css": "docs/less/renderer.less"
        }
      },
      production: {
        options: {
          paths: ["docs/less"],
          yuicompress: true
        },
        files: {
          "docs/css/asq-default-theme.css": "docs/less/asq-default-theme.less",
          "docs/css/renderer.css": "docs/less/renderer.less"
        }
      }
    },

    //watch
    watch: {
      defaults: {
        files: ['lib/**/*.js',
                'dusts/**/*.dust',
                'docs/**/*.dust',
                'previewer/*.js'],
        tasks: ['devbuild'],
        options: {
          livereload: true,
          interrupt: true
        },
      },
      less: {
        files: ['docs/**/*.less'],
        tasks: ['less:development'],
        options: {
          livereload: true,
          interrupt: true
        },
      }
    }

  });
  
  //npm tasks
  require('load-grunt-tasks')(grunt);

  //load custom tasks
  grunt.loadTasks('./tasks');

  // Build grunt
  grunt.registerTask( "build", [ "dust", "post-dust", "browserify", "less:development", "uglify" ] );
  // Default grunt
  grunt.registerTask( "default", [ "build"] );
  // devbuild grunt
  grunt.registerTask( "devbuild", ["dust", "post-dust", "browserify"] );
  // Dev grunt
  grunt.registerTask( "devwatch", [ "devbuild", "watch"] );
};
