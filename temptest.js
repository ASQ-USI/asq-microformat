var cheerio  = require('cheerio');
var testString = '';
//testString += '<section class="asq-exercise">';
testString += '<article class="asq-question multi-choice choose-0-n pull-left" style="width: 430px" id="q-5"> \
     <h3 class="stem"><img width="200" alt="target1" src="img/rect.png"></h3> \
    <ol class="asq-options" class="smaller"> \
      <li class="asq-option" data-correct="true"> \
        This figure is a square. \
      </li> \
      <li class="asq-option"> \
        This figure is a circle. \
      </li> \
    </ol> \
  </article> \
  <article class="asq-question multi-choice choose-0-n pull-right" style="width: 430px" id="q-6"> \
    <h3 class="stem"><img width="200" alt="target1" src="img/shape.png"></h3> \
    <ol class="asq-options" class="smaller"> \
      <li class="asq-option"> \
        This figure is a square. \
      </li> \
      <li class="asq-option"> \
        This figure is a circle. \
      </li> \
    </ol> \
  </article>';
//testString += '</section>';


var $ = cheerio.load(testString)

// assessments parsing
var $questions = $('.asq-question')
, opts = {groupName: "asq-exercise"}
, cnt = 0;

// make sure every question belongs to an exercise

$questions.filter(function(){
  return $(this).closest('.' + opts.groupName).length === 0;
}).each(function(){
  $(this)
    .before('<div class="' + opts.groupName + '" id="'+ (++cnt) +'"></div>');
    // console.log($('#'+cnt))
   $('#' + cnt).prepend($(this).remove());
})

console.log($.html())


// $questions.filter(function(){
//   return $(this).closest('.' + opts.groupName).length > 0;
// }).wrap('<div class="'+ opts.groupName +'"></div>')