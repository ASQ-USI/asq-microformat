var start= new Date()
  , fs = require('fs')
  , beautify_html = require('js-beautify').html
  , ent = require('ent')
  , dust = require('dustjs-linkedin')
  , templates = require("./docs/doc-templates")(dust);

//disable whitespace compression
dust.optimizers.format = function(ctx, node) { return node };

var files = ['static/multiple-choice.html',
             'static/text-input.html',
             'static/code-input.html'];

// create slides for each question
var slides=""
  , sId = zeroPad(3,2) //start from number 3
  , x = 3000;

files.forEach(function(file){
  var question = fs.readFileSync(file, "utf-8");
  //open slide tag
  slides += '\r\n\r\n<section class="step" id="slide' + sId +'"\
   data-x="'+ x+'" data-y="0" data-z="1000">';
  slides += question;
  //close slide tag
  slides += '</section>';
  x += 1500;
});

// append questions to single page demo
dust.render("all", {questionSlides:slides}, function(err, out){
  if (err) throw err;
  
  // make html pretty
  var html = beautify_html(out, { 
    indent_size: 2 ,
    preserve_newlines: true,
    indent_inner_html: true });
  //restore html entities escaped from beautify
  html = ent.decode(html);

  //save presentation
  fs.writeFile('docs/all.html', html, function (err) {
    if (err) return console.error('could not write', err.stack);
    console.log("Single page generated in %s ms", new Date - start)
  });
})

// append slides to demo presentation
dust.render("impress-demo", {questionSlides:slides}, function(err, out){
  if (err) throw err;

  // make html pretty
  var html = beautify_html(out, { 
    indent_size: 2 ,
    preserve_newlines: true,
    indent_inner_html: true });
  //restore html entities escaped from beautify
  html = ent.decode(html);

  //save presentation
  fs.writeFile('docs/impress-demo.html', html, function (err) {
    if (err) return console.error('could not write', err.stack);
    console.log("Presentation generated in %s ms", new Date - start)
  });
})

// adds zeros to reach the required width
// zeroPad(13, 4) => 0013
function zeroPad(number , width){
  var n_ = Math.abs(number);
        var zeros = Math.max(0, width - Math.floor(n_).toString().length );
        var zeroString = Math.pow(10,zeros).toString().substr(1);
        if( number < 0 ) {
                zeroString = '-' + zeroString;
        }

  return zeroString+number;
}
