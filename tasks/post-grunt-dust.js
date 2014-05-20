module.exports = function(grunt) {
  grunt.registerTask('post-dust'
    , "Add dust argument to compiled templates"
    , function(command, collection) {

      var dustConfig = grunt.config.get("dust");
      var targets = Object.keys(dustConfig);
      
      //process compiled template for each target
      targets.forEach(function(target){
        // Get first template destination of target.
        // Expects a format like this:
        // { files: { 'docs/compiled/doc-templates.js': 'docs/**/*.dust' }
        var templatesPath =  Object.keys(dustConfig[target].files)[0];
        var file = grunt.file.read(templatesPath);
        
        //replace first occurence
        file = file.replace(/module.exports = function \(\)/, 'module.exports = function (dust)');
        grunt.file.write(templatesPath, file)
      })
  });
}