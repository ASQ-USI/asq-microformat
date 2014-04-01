module.exports = function(grunt) {
  grunt.registerTask('post-dust'
    , "Add dust argument to compile templates"
    , function(command, collection) {
      var templatesPath = './dusts/compiled/templates.js';
      var file = grunt.file.read(templatesPath);
      //replace first occurence
      file = file.replace(/module.exports = function \(\)/, 'module.exports = function (dust)');
      grunt.file.write(templatesPath, file)
  });
}