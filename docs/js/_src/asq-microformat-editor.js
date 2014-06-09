var ace = require('brace');
require('brace/mode/html');
require('brace/theme/monokai');

var editor = ace.edit("asq-editor")
  , when = require('when')
  , microformat = require('../../../index')
  , parser = new microformat.parser()
  , ent = require('ent')
  , mGen1 = new microformat.generator()
  , mGen2 = new microformat.generator()
  , beautify_html = require('js-beautify').html
  , timer
  , viewerIframe
  , presenterIframe;

$(function onDocumentReady(){
  init();
})

function init(){
  //cache iframes
  viewerIframe = $('#render-viewer')[0];
  presenterIframe = $('#render-presenter')[0];

  //setup editor
  editor.setTheme("ace/theme/monokai");
  editor.getSession().setMode("ace/mode/html");
  //everytime the editor's text is changing
  // parse the text and render
  editor.getSession().on('change', function(e) {
    clearTimeout(timer)
    timer = setTimeout(process, 100)
  });

  //create question menu 
  var templates = require('../editor-question-templates')
    , keys = Object.keys(templates)
    , listHtml = "";

  keys.forEach(function(key){
    listHtml+=  '<a href="#" class="list-group-item">' + key +'</a>\n';
  });
  $('#question-type-list').html(listHtml);

  $('#question-type-list').on('click', '.list-group-item', function(event){
    event.preventDefault();
    $(this).addClass('active')
      .siblings().removeClass('active');
      //add question to editor
      editor.setValue(templates[$(this).html()]);
      editor.session.selection.clearSelection();
  })

  $('.options-section').on('change', 'input[type="checkbox"]', function checkboxChanged(event){
    process();
  })

  //load first question
  $('#question-type-list .list-group-item').eq(0).trigger('click');
}


/**
* Parses the content of the ace editor and render with microformat
*/
function process(){
  var parsed = parser.parse(editor.getValue());

  when.all([ 
    mGen1.render(parsed.html, parsed.exercises, parsed.rubrics, {mode:'preview', userType: 'viewer'}),
    mGen2.render(parsed.html, parsed.exercises, parsed.rubrics, {mode:'preview', userType: 'presenter'})
    ])
  .then(function(out){
    //make html pretty
    var viewerHtml = beautify_html(out[0], { 
                      indent_size: 2 ,
                      preserve_newlines: true });
    var presenterHtml = beautify_html(out[1], { 
                      indent_size: 2 ,
                      preserve_newlines: true });


  injectHtmltoIframe(viewerIframe, viewerHtml)
  injectHtmltoIframe(presenterIframe, presenterHtml)
  

    $('#render-presenter').html(presenterHtml)
    // show generated code
    $('#viewer-src').html(ent.encode(viewerHtml));
    $('#presenter-src').html(ent.encode(presenterHtml));
     $('.markup-section pre code').each(function(i, e) {
      hljs.highlightBlock(e)});
  }).catch(function(err){
     console.log(err, err.stack)
  })
}

function injectHtmltoIframe(iframeEl, html){
   if(iframeEl.contentDocument){
    doc = iframeEl.contentDocument;
  }
  else if(iframeEl.contentWindow){
    doc = iframeEl.contentWindow.document;
  }
  doc.open();
  doc.write(html);
  doc.close();   

  //append css
  var asqCss = $('#asq-theme-css-chk')[0].checked; 
  var btsrpCss = $('#bootstrap-css-chk')[0].checked; 
  var btsrpJs = $('#bootstrap-js-chk')[0].checked; 

  //check if we have to inject sth
  if(!asqCss && !btsrpCss && !btsrpJs) return;

  var $head = $(iframeEl).contents().find("head"); 
  var $body = $(iframeEl).contents().find("body");
  if(asqCss){
    $head.append($('<link/>', 
    { rel: 'stylesheet', href: 'css/asq-default-theme.css', type: 'text/css' }));
  }            
  if(btsrpCss){
    $head.append($('<link/>', 
    { rel: 'stylesheet', href: 'css/bootstrap.min.css', type: 'text/css' }));
  }
  if(btsrpJs){
    $body.append($('<script></script>', 
    { src: 'js/jquery.js', type: 'text/javascript' }));
    $body.append($('<script></script>', 
    { src: 'js/bootstrap.min.js', type: 'text/javascript' }));
    // var script = document.createElement('script');
    // script.type = 'text/javascript';
    // script.src = 'js/boostrap.min.js';
    // $body.append(script);
  }
 
}

