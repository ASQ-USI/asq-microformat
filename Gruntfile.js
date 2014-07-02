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
        src: ['docs/js/_src/asq-microformat-editor.js'],
        dest: 'docs/js/asq-microformat-editor.js',
        options: {
          debug: true
        }        
      },
      editorConfigure:{
        src: ['docs/js/_src/asq-microformat-editor-congigure.js'],
        dest: 'docs/js/asq-microformat-editor-configure.js',
        options: {
          debug: true
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
          "docs/css/docs.css": "docs/less/docs.less",
          "docs/css/microformat-editor.css": "docs/less/microformat-editor.less"
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
      dust: {
        files:['dusts/**/*.dust',
              'docs/**/*.dust'],
          tasks: ['dust', 'post-dust'],
        options: {
          livereload: true,
          interrupt: true
        },
      },
      js: {
        files:['lib/**/*.js',
                'docs/js/_src/**/*.js',                
                'previewer/*.js'],
        tasks: ['browserify'],
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
  grunt.registerTask( 'build', [ 'dust', 'post-dust', 'browserify', 'less:development', 'uglify' ] );
  // Default grunt
  grunt.registerTask( 'default', [ 'build'] );
  // devbuild grunt
  grunt.registerTask( 'devbuild', ['dust', 'post-dust', 'browserify',  'less:development'] );
  // Dev grunt
  grunt.registerTask( 'devwatch', [ 'devbuild', 'watch'] );
};
