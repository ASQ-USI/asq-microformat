
module.exports = {
  'multiple-choice-radio' :'<article class="asq-question multi-choice choose-1" id="mc-1">\n\
  <h3 class="asq-stem">Lugano is located in...</h3>\n\
  <ol class="asq-options">\n\
    <li class="asq-option" data-correct="true">\n\
      Switzerland\n\
    </li>\n\
    <li class="asq-option">\n\
      Italy\n\
    </li>\n\
    <li class="asq-option">\n\
      France\n\
    </li>\n\
    <li class="asq-option">\n\
      Germany\n\
     </li>\n\
  </ol>\n\
</article>',
  'multiple-choice-checkbox' :'<article class="asq-question multi-choice choose-0-n" id="mc-1">\n\
  <h3 class="asq-stem">In Switzerland official languages include...</h3>\n\
  <ol class="asq-options">\n\
    <li class="asq-option" data-correct="true">\n\
      German\n\
    </li>\n\
    <li class="asq-option" data-correct="true">\n\
      French\n\
    </li>\n\
    <li class="asq-option">\n\
      Portuguese\n\
    </li>\n\
    <li class="asq-option" data-correct="true">\n\
      Italian\n\
     </li>\n\
  </ol>\n\
</article>',
'text-input': '<article class="asq-question text-input" id="ti-1">\n\
  <h3 class="asq-stem" data-asq-correct-answer="3">What is the square root of 9?</h3>\n\
</article>',
'code-input': '<article class="asq-question code-input" data-asq-syntax="javascript"  data-asq-theme="monokai" id="ci-1">\n\
  <h3 class="asq-stem">Code an infinite loop</h3>\n\
</article>',
'css-select': '<article class="asq-question asq-css-select"  data-asq-code="<ul>\n\
  <li class=\'daclass\'>\n\
    <ul>\n\
      <li></li>\n\
      <li></li>\n\
      <li></li>\n\
    </ul>\n\
  </li>\n\
  <li></li>\n\
  <li></li>\n\
  <li>\n\
    <div>\n\
      <p></p>\n\
      <p class=\'pclass\'></p>\n\
    </div>\n\
  </li>\n\
</ul>" id="cs-1">\n \
  <h3 class="asq-stem">Select the innermost li elements</h3>\n\
</article>',
'js-function-body': '<article class="asq-question asq-js-function-body" id="jfb-1"\n\
data-asq-code-header="function wrap(str, tagName){" data-asq-code-footer="} //function ends here"\n\
data-asq-eval-command="wrap(\'hello World\', \'div\');" data-asq-correct-output=\'"<div>hello World</div>"\'> \n\
   <h3 class="stem small">Implement a function that wraps a given string with an HTML tag</h3>\n\
</article>'
}

