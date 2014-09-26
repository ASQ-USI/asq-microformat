module.exports = function (dust) {

	// answer.dust
	(function(){dust.register("answer",body_0);function body_0(chk,ctx){return chk.reference(ctx.getPath(false,["question","stem"]),ctx,"h",["s"]).write("<ul class=\"nav nav-tabs\">").exists(ctx.getPath(false,["activePanes","correct"]),ctx,{"block":body_1},null).exists(ctx.getPath(false,["activePanes","right-vs-wrong"]),ctx,{"block":body_2},null).exists(ctx.getPath(false,["activePanes","distinct-answers"]),ctx,{"block":body_3},null).exists(ctx.getPath(false,["activePanes","distinct-options"]),ctx,{"block":body_4},null).exists(ctx.getPath(false,["activePanes","correctness"]),ctx,{"block":body_5},null).write("</ul><div class=\"tab-content\"><!--  Displays correct solution -->").exists(ctx.getPath(false,["activePanes","correct"]),ctx,{"block":body_6},null).write("<!-- Displays Pie-Chart Right vs. Wrong -->").exists(ctx.getPath(false,["activePanes","right-vs-wrong"]),ctx,{"block":body_10},null).write("<!-- Display distinct answers -->").exists(ctx.getPath(false,["activePanes","distinct-answers"]),ctx,{"block":body_11},null).write("<!-- Display distinct options  -->").exists(ctx.getPath(false,["activePanes","distinct-options"]),ctx,{"block":body_12},null).write("<!-- Display correctness  -->").exists(ctx.getPath(false,["activePanes","correctness"]),ctx,{"block":body_13},null).write("</div>");}function body_1(chk,ctx){return chk.write("<li class=\"active\"><a href=\"#answersolutions-").reference(ctx.get("statId"),ctx,"h").write("\"  data-toggle=\"tab\">Correct Answer</a></li>");}function body_2(chk,ctx){return chk.write("<li><a href=\"#rvsw-").reference(ctx.get("statId"),ctx,"h").write("\" data-toggle=\"tab\">Right vs. Wrong</a></li>");}function body_3(chk,ctx){return chk.write("<li><a href=\"#mscstats-").reference(ctx.get("statId"),ctx,"h").write("\" data-toggle=\"tab\">Distinct Answers</a></li>");}function body_4(chk,ctx){return chk.write("<li><a href=\"#diffAns-").reference(ctx.get("statId"),ctx,"h").write("\" data-toggle=\"tab\">Distinct Options</a></li>");}function body_5(chk,ctx){return chk.write("<li><a href=\"#asq-viz-tab-").reference(ctx.get("statId"),ctx,"h").write("\" data-toggle=\"tab\">Correctness</a></li>");}function body_6(chk,ctx){return chk.write("<div class=\"tab-pane answersolutions active\" id='answersolutions-").reference(ctx.get("statId"),ctx,"h").write("'>").exists(ctx.getPath(false,["question","correctAnswer"]),ctx,{"else":body_7,"block":body_9},null).write("</div>");}function body_7(chk,ctx){return chk.write("<ol>").section(ctx.getPath(false,["question","questionOptions"]),ctx,{"block":body_8},{"formButtonType":ctx.getPath(false,["question","formButtonType"]),"htmlId":ctx.getPath(false,["question","htmlId"])}).write("</ol>");}function body_8(chk,ctx){return chk.write("<li class=\"").reference(ctx.get("classList"),ctx,"h").write("\" ><label class=\"").reference(ctx.get("formButtonType"),ctx,"h").write("\"><input type=\"").reference(ctx.get("formButtonType"),ctx,"h").write("\" name=\"").reference(ctx.get("htmlId"),ctx,"h").write("\" value=\"").reference(ctx.get("$idx"),ctx,"h").write("\" disabled> ").reference(ctx.get("text"),ctx,"h",["s"]).write("</label></li>\n");}function body_9(chk,ctx){return chk;}function body_10(chk,ctx){return chk.write("<div class=\"tab-pane\" id=\"rvsw-").reference(ctx.get("statId"),ctx,"h").write("\"><div id=\"rvswChart-").reference(ctx.get("statId"),ctx,"h").write("\" class=\"rvswChart\" style=\"width: 100%; height: 500px;\"></div></div>");}function body_11(chk,ctx){return chk.write("<div class=\"tab-pane\" id=\"mscstats-").reference(ctx.get("statId"),ctx,"h").write("\"><div id=\"mscstatChart-").reference(ctx.get("statId"),ctx,"h").write("\" class=\"distinctAnswers\" style=\"height:500px\"></div></div>");}function body_12(chk,ctx){return chk.write("<div class=\"tab-pane\" id=\"diffAns-").reference(ctx.get("statId"),ctx,"h").write("\"><div id=\"diffAnsChart-").reference(ctx.get("statId"),ctx,"h").write("\" class=\"distinctOptions\" style=\"height:500px\"></div></div>");}function body_13(chk,ctx){return chk.write("<div class=\"tab-pane\" id=\"asq-viz-tab-").reference(ctx.get("statId"),ctx,"h").write("\"><div class=\"asq-viz-graph\" data-width=\"").reference(ctx.get("width"),ctx,"h").write("\" data-height=\"").reference(ctx.get("height"),ctx,"h").write("\" data-margin='").reference(ctx.get("margin"),ctx,"h",["s"]).write("'></div></div>");}return body_0;})();
	 // assessment-grid.dust
	(function(){dust.register("assessment-grid",body_0);function body_0(chk,ctx){return chk.write("<div class=\"asq-assess-grid-holder\"></div>");}return body_0;})();
	 // assessment-viewer.dust
	(function(){dust.register("assessment-viewer",body_0);function body_0(chk,ctx){return chk.write(" <div class=\"asq-assessment-container\"><h1>").helper("eq",ctx,{"block":body_1},{"key":ctx.getPath(false,["exercises","0","type"]),"value":"self"}).helper("eq",ctx,{"block":body_2},{"key":ctx.getPath(false,["exercises","0","type"]),"value":"peer"}).write("</h1>").section(ctx.get("exercises"),ctx,{"block":body_3},null).write("</div>");}function body_1(chk,ctx){return chk.write("Self Assessment");}function body_2(chk,ctx){return chk.write("Peer Assessment");}function body_3(chk,ctx){return chk.write("<div class=\"asq-assessment-outer\"><div class=\"asq-assessment\"><form class=\"asq-assessment-inner\" data-asq-exercise=\"").reference(ctx.get("_id"),ctx,"h").write("\" data-asq-assessee=\"").reference(ctx.get("assessee"),ctx,"h").write("\">").section(ctx.get("questions"),ctx,{"block":body_4},{"exercise":ctx.get("_id")}).write("<div class=\"asq-flex-box\"><span class=\"pull-right \"><button type=\"submit\" class=\"btn btn-block btn-success\">Submit</button></span></div></form></div></div>");}function body_4(chk,ctx){return chk.write("<div class=\"asq-flex-box\"><div class=\"asq-flex-col asq-question-preview\" data-asq-question=\"").reference(ctx.get("_id"),ctx,"h").write("\" data-asq-answer=\"").reference(ctx.get("answer"),ctx,"h").write("\">").partial("question-viewer",ctx,null).write(" </div><div class=\"asq-flex-handle\"></div><div class=\"asq-flex-col asq-rubric\" data-asq-target-question=\"").reference(ctx.get("_id"),ctx,"h").write("\" data-asq-target-answer=\"").reference(ctx.get("answer"),ctx,"h").write("\">").partial("rubric-viewer",ctx,{"question":ctx.get("_id")}).write("<span class=\"pull-right\"><span>Grade: <span class=\"label label-default asq-rubrics-grade\">0</span> </span><span class=\"asq-confidence-label\">Confidence:</span> ").partial("rating",ctx,{"rated":body_5,"val":"7"}).write("</span></div></div>");}function body_5(chk,ctx){return chk.write("-for-rubric-").reference(ctx.get("_id"),ctx,"h").write("-").reference(ctx.get("exercise"),ctx,"h");}return body_0;})();
	 // exercise-presenter.dust
	(function(){dust.register("exercise-presenter",body_0);function body_0(chk,ctx){return chk.write("<form action=\"\">").reference(ctx.get("exerciseContent"),ctx,"h",["s"]).helper("if",ctx,{"block":body_1},{"cond":body_2}).partial("progress-bar",ctx,null).write("</form>");}function body_1(chk,ctx){return chk.partial("assessment-grid",ctx,null).write(" ");}function body_2(chk,ctx){return chk.write("'").reference(ctx.get("peer"),ctx,"h").write("'.length || '").reference(ctx.get("self"),ctx,"h").write("'.length");}return body_0;})();
	 // exercise-viewer.dust
	(function(){dust.register("exercise-viewer",body_0);function body_0(chk,ctx){return chk.write("<form action=\"\">").reference(ctx.get("exerciseContent"),ctx,"h",["s"]).write("<input type=\"hidden\" name=\"exercise-id\" value=\"").reference(ctx.get("id"),ctx,"h").write("\"><p class=\"text-right\"><button type=\"submit\" class=\"btn btn-success\">Submit</button></p></form>");}return body_0;})();
	 // progress-bar.dust
	(function(){dust.register("progress-bar",body_0);function body_0(chk,ctx){return chk.write("<div class=\"asq-progress-info\"><div class=\"progress\"><div class=\"progress-bar asq-progress-answers\" style=\"width: 0%\"></div>").exists(ctx.get("self"),ctx,{"block":body_1},null).exists(ctx.get("peer"),ctx,{"block":body_2},null).write("</div><div class=\"asq-progress-details container-fluid\"><div class=\"row\"><div class=\"col-sm-4 col-xs-12 text-left asq-label-answers\"><span class=\"label label-primary\">Answers</span></div>").exists(ctx.get("self"),ctx,{"block":body_3},null).exists(ctx.get("peer"),ctx,{"block":body_4},null).write("</div></div></div>");}function body_1(chk,ctx){return chk.write("<div class=\"progress-bar progress-bar-warning asq-progress-self\" style=\"width: 0%\"></div>");}function body_2(chk,ctx){return chk.write("<div class=\"progress-bar progress-bar-success asq-progress-peer\" style=\"width: 0%\"></div>");}function body_3(chk,ctx){return chk.write("<div class=\"col-sm-4 col-xs-12 text-center asq-label-self\"><span class=\"label label-warning text-center\">Self</span></div>");}function body_4(chk,ctx){return chk.write("<div class=\"col-sm-4").notexists(ctx.get("self"),ctx,{"block":body_5},null).write(" col-xs-12 text-right asq-label-peer\"><span class=\"label label-success\">Peer</span></div>");}function body_5(chk,ctx){return chk.write(" col-sm-offset-4");}return body_0;})();
	 // question-asq-css-select-presenter.dust
	(function(){dust.register("question-asq-css-select-presenter",body_0);function body_0(chk,ctx){return chk.reference(ctx.get("body"),ctx,"h",["s"]).write("<div class=\"asq-css-select-code\"><pre><code>").reference(ctx.get("code"),ctx,"h").write("</code></pre></div><label class=\"control-label\" for=\"inputText\">Selector</label><input type=\"text\" class=\"\" id=\"inputText\" placeholder=\"Your solution\"").exists(ctx.get("submission"),ctx,{"block":body_1},null).write("/>");}function body_1(chk,ctx){return chk.write("value=\"").reference(ctx.getPath(true,["submission"]),ctx,"h").write("\" disabled");}return body_0;})();
	 // question-asq-css-select-viewer.dust
	(function(){dust.register("question-asq-css-select-viewer",body_0);function body_0(chk,ctx){return chk.reference(ctx.get("body"),ctx,"h",["s"]).write("<div class=\"asq-css-select-code\"><pre><code>").reference(ctx.get("code"),ctx,"h").write("</code></pre></div><label class=\"control-label\" for=\"inputText\">Selector</label><input type=\"text\" class=\"\" id=\"inputText\" placeholder=\"Your solution\"").exists(ctx.get("submission"),ctx,{"block":body_1},null).write("/>");}function body_1(chk,ctx){return chk.write("value=\"").reference(ctx.getPath(true,["submission"]),ctx,"h").write("\" disabled");}return body_0;})();
	 // question-asq-js-function-body-presenter.dust
	(function(){dust.register("question-asq-js-function-body-presenter",body_0);function body_0(chk,ctx){return chk.reference(ctx.get("body"),ctx,"h",["s"]).write("<div><pre><code><span class=\"asq-code-header\">").reference(ctx.get("codeHeader"),ctx,"h").write("</span><div class=\"form-control asq-code-input\" id=\"inputText\" contenteditable=true>").reference(ctx.get("submission"),ctx,"h").write("</div><span class=\"asq-code-footer\">").reference(ctx.get("codeFooter"),ctx,"h").write("</span></code></pre></div><h4>Test command</h4><kbd class=\"asq-command-line\"><i class=\"fa fa-chevron-right\"></i> <span class=\"asq-evaluate\">").reference(ctx.get("evalCommand"),ctx,"h").write("</span></kbd><br><strong>Result:</strong><br><div class=\"well asq-result-wrapper\"><i class=\"asq-correct-ok glyphicon glyphicon-ok\"></i><samp class=\"asq-result\"><samp></div>");}return body_0;})();
	 // question-asq-js-function-body-viewer.dust
	(function(){dust.register("question-asq-js-function-body-viewer",body_0);function body_0(chk,ctx){return chk.reference(ctx.get("body"),ctx,"h",["s"]).write("<div><pre><code><span class=\"asq-code-header\">").reference(ctx.get("codeHeader"),ctx,"h").write("</span><div class=\"form-control asq-code-input\" id=\"inputText\" contenteditable=true>").reference(ctx.get("submission"),ctx,"h").write("</div><span class=\"asq-code-footer\">").reference(ctx.get("codeFooter"),ctx,"h").write("</span></code></pre></div><h4>Test command</h4><kbd class=\"asq-command-line\"><i class=\"fa fa-chevron-right\"></i> <span class=\"asq-evaluate\">").reference(ctx.get("evalCommand"),ctx,"h").write("</span></kbd><br><strong>Result:</strong><br><div class=\"well asq-result-wrapper\"><i class=\"asq-correct-ok glyphicon glyphicon-ok\"></i><samp class=\"asq-result\"><samp></div>");}return body_0;})();
	 // question-code-input-presenter.dust
	(function(){dust.register("question-code-input-presenter",body_0);function body_0(chk,ctx){return chk.write("<div id=\"code-editor-").reference(ctx.get("id"),ctx,"h").write("\" class=\"asq-code-editor\" >").reference(ctx.get("body"),ctx,"h").write("</div>");}return body_0;})();
	 // question-code-input-viewer.dust
	(function(){dust.register("question-code-input-viewer",body_0);function body_0(chk,ctx){return chk.write("<div id=\"code-editor-").reference(ctx.get("id"),ctx,"h").write("\" class=\"asq-code-editor\">").exists(ctx.get("submission"),ctx,{"else":body_1,"block":body_2},null).write("</div>");}function body_1(chk,ctx){return chk.reference(ctx.get("body"),ctx,"h");}function body_2(chk,ctx){return chk.reference(ctx.getPath(false,["submission","0"]),ctx,"h");}return body_0;})();
	 // question-multi-choice-presenter.dust
	(function(){dust.register("question-multi-choice-presenter",body_0);function body_0(chk,ctx){return chk.write("<ol>").section(ctx.get("questionOptions"),ctx,{"block":body_1},null).write("</ol>");}function body_1(chk,ctx){return chk.write("<li class=\"").reference(ctx.get("classList"),ctx,"h").write("\" >").reference(ctx.get("text"),ctx,"h",["s"]).write("</li>\n");}return body_0;})();
	 // question-multi-choice-stats.dust
	(function(){dust.register("question-multi-choice-stats",body_0);function body_0(chk,ctx){return chk.write("<form><ol>").section(ctx.getPath(false,["question","questionOptions"]),ctx,{"block":body_1},{"formButtonType":ctx.getPath(false,["question","formButtonType"]),"htmlId":ctx.getPath(false,["question","htmlId"])}).write("</ol></form>");}function body_1(chk,ctx){return chk.write("<li class=\"").reference(ctx.get("classList"),ctx,"h").write("\" ><label class=\"").reference(ctx.get("formButtonType"),ctx,"h").write("\"><input type=\"").reference(ctx.get("formButtonType"),ctx,"h").write("\" name=\"").reference(ctx.get("htmlId"),ctx,"h").write("\" value=\"").reference(ctx.get("$idx"),ctx,"h").write("\" ").exists(ctx.get("correct"),ctx,{"block":body_2},null).write(" disabled> ").reference(ctx.get("text"),ctx,"h",["s"]).write("</label></li>\n");}function body_2(chk,ctx){return chk.write(" checked ");}return body_0;})();
	 // question-multi-choice-viewer.dust
	(function(){dust.register("question-multi-choice-viewer",body_0);function body_0(chk,ctx){return chk.write("<ol>").section(ctx.get("questionOptions"),ctx,{"block":body_1},null).write("</ol>");}function body_1(chk,ctx){return chk.write("<li class=\"").reference(ctx.get("classList"),ctx,"h").write("\" ><label class=\"").reference(ctx.get("formButtonType"),ctx,"h").write("\">\n<input type=\"").reference(ctx.get("formButtonType"),ctx,"h").write("\" name=\"").reference(ctx.get("htmlId"),ctx,"h").write("\" value=\"").reference(ctx.get("$idx"),ctx,"h").write("\"").exists(ctx.get("submission"),ctx,{"block":body_2},null).write("> ").reference(ctx.get("text"),ctx,"h",["s"]).write("\n</label></li>\n");}function body_2(chk,ctx){return chk.write(" disabled").exists(ctx.getPath(false,["submission",ctx.get("$idx")]),ctx,{"block":body_3},null);}function body_3(chk,ctx){return chk.write(" checked");}return body_0;})();
	 // question-presenter.dust
	(function(){dust.register("question-presenter",body_0);function body_0(chk,ctx){return chk.reference(ctx.get("stem"),ctx,"h",["s"]).partial(body_1,ctx,null).write(" ");}function body_1(chk,ctx){return chk.write("question-").reference(ctx.get("questionType"),ctx,"h").write("-presenter");}return body_0;})();
	 // question-text-input-presenter.dust
	(function(){dust.register("question-text-input-presenter",body_0);function body_0(chk,ctx){return chk.reference(ctx.get("body"),ctx,"h",["s"]).write("<input type=\"text\" class=\"\" id=\"inputText\" placeholder=\"Your solution\">");}return body_0;})();
	 // question-text-input-viewer.dust
	(function(){dust.register("question-text-input-viewer",body_0);function body_0(chk,ctx){return chk.reference(ctx.get("body"),ctx,"h",["s"]).write("<input type=\"text\" class=\"\" id=\"inputText\" placeholder=\"Your solution\"").exists(ctx.get("submission"),ctx,{"block":body_1},null).write("/>");}function body_1(chk,ctx){return chk.write("value=\"").reference(ctx.getPath(true,["submission"]),ctx,"h").write("\" disabled");}return body_0;})();
	 // question-viewer.dust
	(function(){dust.register("question-viewer",body_0);function body_0(chk,ctx){return chk.reference(ctx.get("stem"),ctx,"h",["s"]).partial(body_1,ctx,null).write(" <input type=\"hidden\" name=\"question-id\" value=").reference(ctx.get("id"),ctx,"h").write("><p class=\"text-right\"><span class=\"asq-rating-widget\"><span class=\"asq-confidence-label\">Confidence:</span>").exists(ctx.get("confidence"),ctx,{"else":body_2,"block":body_4},null).write("</span></p>");}function body_1(chk,ctx){return chk.write("question-").reference(ctx.get("questionType"),ctx,"h").write("-viewer");}function body_2(chk,ctx){return chk.partial("rating",ctx,{"rated":body_3,"val":0});}function body_3(chk,ctx){return chk.reference(ctx.get("id"),ctx,"h");}function body_4(chk,ctx){return chk.partial("rating",ctx,{"rated":body_5,"val":ctx.get("confidence")});}function body_5(chk,ctx){return chk.reference(ctx.get("id"),ctx,"h");}return body_0;})();
	 // rating.dust
	(function(){dust.register("rating",body_0);function body_0(chk,ctx){return chk.write("<span class=\"asq-rating").helper("if",ctx,{"block":body_1},{"cond":body_2}).write("\"><!-- 5 stars rating --><input type=\"radio\" id=\"asq-rating-").helper("if",ctx,{"block":body_3},{"cond":body_4}).reference(ctx.get("rated"),ctx,"h").write("-5\" value=\"5\"class=\"asq-rating-input\" name=\"asq-rating-").helper("if",ctx,{"block":body_5},{"cond":body_6}).reference(ctx.get("rated"),ctx,"h").write("\"").helper("if",ctx,{"block":body_7},{"cond":body_9}).write("><label for=\"asq-rating-").helper("if",ctx,{"block":body_10},{"cond":body_11}).reference(ctx.get("rated"),ctx,"h").write("-5\" class=\"asq-rating-star\"></label><!-- 4 stars rating --><input type=\"radio\" id=\"asq-rating-").helper("if",ctx,{"block":body_12},{"cond":body_13}).reference(ctx.get("rated"),ctx,"h").write("-4\" value=\"4\"class=\"asq-rating-input\" name=\"asq-rating-").helper("if",ctx,{"block":body_14},{"cond":body_15}).reference(ctx.get("rated"),ctx,"h").write("\"").helper("if",ctx,{"block":body_16},{"cond":body_18}).write("><label for=\"asq-rating-").helper("if",ctx,{"block":body_19},{"cond":body_20}).reference(ctx.get("rated"),ctx,"h").write("-4\" class=\"asq-rating-star\"></label><!-- 3 stars rating --><input type=\"radio\" id=\"asq-rating-").helper("if",ctx,{"block":body_21},{"cond":body_22}).reference(ctx.get("rated"),ctx,"h").write("-3\" value=\"3\"class=\"asq-rating-input\" name=\"asq-rating-").helper("if",ctx,{"block":body_23},{"cond":body_24}).reference(ctx.get("rated"),ctx,"h").write("\"").helper("if",ctx,{"block":body_25},{"cond":body_27}).write("><label for=\"asq-rating-").helper("if",ctx,{"block":body_28},{"cond":body_29}).reference(ctx.get("rated"),ctx,"h").write("-3\" class=\"asq-rating-star\"></label><!-- 2 stars rating --><input type=\"radio\" id=\"asq-rating-").helper("if",ctx,{"block":body_30},{"cond":body_31}).reference(ctx.get("rated"),ctx,"h").write("-2\" value=\"2\"class=\"asq-rating-input\" name=\"asq-rating-").helper("if",ctx,{"block":body_32},{"cond":body_33}).reference(ctx.get("rated"),ctx,"h").write("\"").helper("if",ctx,{"block":body_34},{"cond":body_36}).write("><label for=\"asq-rating-").helper("if",ctx,{"block":body_37},{"cond":body_38}).reference(ctx.get("rated"),ctx,"h").write("-2\" class=\"asq-rating-star\"></label><!-- 1 star rating --><input type=\"radio\" id=\"asq-rating-").helper("if",ctx,{"block":body_39},{"cond":body_40}).reference(ctx.get("rated"),ctx,"h").write("-1\" value=\"1\"class=\"asq-rating-input\" name=\"asq-rating-").helper("if",ctx,{"block":body_41},{"cond":body_42}).reference(ctx.get("rated"),ctx,"h").write("\"").helper("if",ctx,{"block":body_43},{"cond":body_45}).write("><label for=\"asq-rating-").helper("if",ctx,{"block":body_46},{"cond":body_47}).reference(ctx.get("rated"),ctx,"h").write("-1\" class=\"asq-rating-star\"></label></span>");}function body_1(chk,ctx){return chk.write(" disabled");}function body_2(chk,ctx){return chk.write("1<=").reference(ctx.get("val"),ctx,"h").write(" && ").reference(ctx.get("val"),ctx,"h").write(" <= 5");}function body_3(chk,ctx){return chk.write("disabled-");}function body_4(chk,ctx){return chk.write("1<=").reference(ctx.get("val"),ctx,"h").write(" && ").reference(ctx.get("val"),ctx,"h").write(" <= 5");}function body_5(chk,ctx){return chk.write("disabled-");}function body_6(chk,ctx){return chk.write("1<=").reference(ctx.get("val"),ctx,"h").write(" && ").reference(ctx.get("val"),ctx,"h").write(" <= 5");}function body_7(chk,ctx){return chk.write(" disabled").helper("eq",ctx,{"block":body_8},{"key":ctx.get("val"),"value":5});}function body_8(chk,ctx){return chk.write(" checked ");}function body_9(chk,ctx){return chk.write("1<=").reference(ctx.get("val"),ctx,"h").write(" && ").reference(ctx.get("val"),ctx,"h").write(" <= 5");}function body_10(chk,ctx){return chk.write("disabled-");}function body_11(chk,ctx){return chk.write("1<=").reference(ctx.get("val"),ctx,"h").write(" && ").reference(ctx.get("val"),ctx,"h").write(" <= 5");}function body_12(chk,ctx){return chk.write("disabled-");}function body_13(chk,ctx){return chk.write("1<=").reference(ctx.get("val"),ctx,"h").write(" && ").reference(ctx.get("val"),ctx,"h").write(" <= 5");}function body_14(chk,ctx){return chk.write("disabled-");}function body_15(chk,ctx){return chk.write("1<=").reference(ctx.get("val"),ctx,"h").write(" && ").reference(ctx.get("val"),ctx,"h").write(" <= 5");}function body_16(chk,ctx){return chk.write(" disabled").helper("eq",ctx,{"block":body_17},{"key":ctx.get("val"),"value":4});}function body_17(chk,ctx){return chk.write(" checked ");}function body_18(chk,ctx){return chk.write("1<=").reference(ctx.get("val"),ctx,"h").write(" && ").reference(ctx.get("val"),ctx,"h").write(" <= 5");}function body_19(chk,ctx){return chk.write("disabled-");}function body_20(chk,ctx){return chk.write("1<=").reference(ctx.get("val"),ctx,"h").write(" && ").reference(ctx.get("val"),ctx,"h").write(" <= 5");}function body_21(chk,ctx){return chk.write("disabled-");}function body_22(chk,ctx){return chk.write("1<=").reference(ctx.get("val"),ctx,"h").write(" && ").reference(ctx.get("val"),ctx,"h").write(" <= 5");}function body_23(chk,ctx){return chk.write("disabled-");}function body_24(chk,ctx){return chk.write("1<=").reference(ctx.get("val"),ctx,"h").write(" && ").reference(ctx.get("val"),ctx,"h").write(" <= 5");}function body_25(chk,ctx){return chk.write(" disabled").helper("eq",ctx,{"block":body_26},{"key":ctx.get("val"),"value":3});}function body_26(chk,ctx){return chk.write(" checked ");}function body_27(chk,ctx){return chk.write("1<=").reference(ctx.get("val"),ctx,"h").write(" && ").reference(ctx.get("val"),ctx,"h").write(" <= 5");}function body_28(chk,ctx){return chk.write("disabled-");}function body_29(chk,ctx){return chk.write("1<=").reference(ctx.get("val"),ctx,"h").write(" && ").reference(ctx.get("val"),ctx,"h").write(" <= 5");}function body_30(chk,ctx){return chk.write("disabled-");}function body_31(chk,ctx){return chk.write("1<=").reference(ctx.get("val"),ctx,"h").write(" && ").reference(ctx.get("val"),ctx,"h").write(" <= 5");}function body_32(chk,ctx){return chk.write("disabled-");}function body_33(chk,ctx){return chk.write("1<=").reference(ctx.get("val"),ctx,"h").write(" && ").reference(ctx.get("val"),ctx,"h").write(" <= 5");}function body_34(chk,ctx){return chk.write(" disabled").helper("eq",ctx,{"block":body_35},{"key":ctx.get("val"),"value":2});}function body_35(chk,ctx){return chk.write(" checked ");}function body_36(chk,ctx){return chk.write("1<=").reference(ctx.get("val"),ctx,"h").write(" && ").reference(ctx.get("val"),ctx,"h").write(" <= 5");}function body_37(chk,ctx){return chk.write("disabled-");}function body_38(chk,ctx){return chk.write("1<=").reference(ctx.get("val"),ctx,"h").write(" && ").reference(ctx.get("val"),ctx,"h").write(" <= 5");}function body_39(chk,ctx){return chk.write("disabled-");}function body_40(chk,ctx){return chk.write("1<=").reference(ctx.get("val"),ctx,"h").write(" && ").reference(ctx.get("val"),ctx,"h").write(" <= 5");}function body_41(chk,ctx){return chk.write("disabled-");}function body_42(chk,ctx){return chk.write("1<=").reference(ctx.get("val"),ctx,"h").write(" && ").reference(ctx.get("val"),ctx,"h").write(" <= 5");}function body_43(chk,ctx){return chk.write(" disabled").helper("eq",ctx,{"block":body_44},{"key":ctx.get("val"),"value":1});}function body_44(chk,ctx){return chk.write(" checked ");}function body_45(chk,ctx){return chk.write("1<=").reference(ctx.get("val"),ctx,"h").write(" && ").reference(ctx.get("val"),ctx,"h").write(" <= 5");}function body_46(chk,ctx){return chk.write("disabled-");}function body_47(chk,ctx){return chk.write("1<=").reference(ctx.get("val"),ctx,"h").write(" && ").reference(ctx.get("val"),ctx,"h").write(" <= 5");}return body_0;})();
	 // rubric-footer-viewer.dust
	(function(){dust.register("rubric-footer-viewer",body_0);function body_0(chk,ctx){return chk.write("<p class=\"text-right\"><span class=\"asq-confidence-label\">Confidence:</span> ").partial("rating",ctx,{"rated":ctx.get("rated"),"ratin":"9"}).write("<button type=\"submit\" class=\"btn btn-success\">Submit</button></p>");}return body_0;})();
	 // rubric-multi-choice-viewer.dust
	(function(){dust.register("rubric-multi-choice-viewer",body_0);function body_0(chk,ctx){return chk.write("<div class=\"panel-heading\"><h4 class=\"panel-title\"><a data-toggle=\"collapse\" href=\"#collapse-").reference(ctx.get("_id"),ctx,"h").write("\">").reference(ctx.get("stemText"),ctx,"h").write("</a><span class=\"label label-default asq-rubric-grade\"></span></h4></div><div id=\"collapse-").reference(ctx.get("_id"),ctx,"h").write("\" class=\"panel-collapse collapse in\"><div class=\"panel-body\"><div class=\"input-group asq-rubric-group\"><ul class=\"asq-rubric-list list-group\">").section(ctx.get("criteria"),ctx,{"block":body_1},null).write("</ul></div></div></div>");}function body_1(chk,ctx){return chk.write("<li class=\"list-group-item\"><div class=\"asq-rubric-elem\"><input type=\"").reference(ctx.get("formButtonType"),ctx,"h").write("\" name=\"collaspe-").reference(ctx.get("_id"),ctx,"h").write("\" value=\"").reference(ctx.get("points"),ctx,"h").write("\"/><span class=\"label label-default\">").reference(ctx.get("label"),ctx,"h").write("</span></div><div class=\"asq-rubric-elem\">").reference(ctx.get("desc"),ctx,"h",["s"]).write("</div></li>");}return body_0;})();
	 // rubric-viewer.dust
	(function(){dust.register("rubric-viewer",body_0);function body_0(chk,ctx){return chk.write("<div class=\"panel-group\">").section(ctx.get("rubrics"),ctx,{"block":body_1},{"question":ctx.get("question")}).write("</div>");}function body_1(chk,ctx){return chk.write("<div class=\"panel panel-default\" data-asq-rubric=\"").reference(ctx.get("_id"),ctx,"h").write("\" data-asq-score=\"0\" data-asq-maxScore=\"").reference(ctx.get("maxScore"),ctx,"h").write("\" data-asq-deduct-points=\"").reference(ctx.get("deductPoints"),ctx,"h").write("\"\">").partial(body_2,ctx,null).write("</div>");}function body_2(chk,ctx){return chk.write("rubric-").reference(ctx.get("questionType"),ctx,"h").write("-viewer");}return body_0;})();
	 // stats.dust
	(function(){dust.register("stats",body_0);function body_0(chk,ctx){return chk.reference(ctx.getPath(false,["question","stem"]),ctx,"h",["s"]).write("<ul class=\"nav nav-tabs\">").exists(ctx.getPath(false,["activePanes","correct"]),ctx,{"block":body_1},null).exists(ctx.getPath(false,["activePanes","right-vs-wrong"]),ctx,{"block":body_2},null).exists(ctx.getPath(false,["activePanes","distinct-answers"]),ctx,{"block":body_3},null).exists(ctx.getPath(false,["activePanes","distinct-options"]),ctx,{"block":body_4},null).exists(ctx.getPath(false,["activePanes","correctness"]),ctx,{"block":body_5},null).write("</ul><div class=\"tab-content\"><!--  Displays correct solution -->").exists(ctx.getPath(false,["activePanes","correct"]),ctx,{"block":body_6},null).write("<!-- Displays Pie-Chart Right vs. Wrong -->").exists(ctx.getPath(false,["activePanes","right-vs-wrong"]),ctx,{"block":body_9},null).write("<!-- Display distinct answers -->").exists(ctx.getPath(false,["activePanes","distinct-answers"]),ctx,{"block":body_10},null).write("<!-- Display distinct options  -->").exists(ctx.getPath(false,["activePanes","distinct-options"]),ctx,{"block":body_11},null).write("<!-- Display correctness  -->").exists(ctx.getPath(false,["activePanes","correctness"]),ctx,{"block":body_12},null).write("</div>");}function body_1(chk,ctx){return chk.write("<li class=\"active\"><a href=\"#answersolutions-").reference(ctx.get("statId"),ctx,"h").write("\"  data-toggle=\"tab\">Correct Answer</a></li>");}function body_2(chk,ctx){return chk.write("<li><a href=\"#rvsw-").reference(ctx.get("statId"),ctx,"h").write("\" data-toggle=\"tab\">Right vs. Wrong</a></li>");}function body_3(chk,ctx){return chk.write("<li><a href=\"#mscstats-").reference(ctx.get("statId"),ctx,"h").write("\" data-toggle=\"tab\">Distinct Answers</a></li>");}function body_4(chk,ctx){return chk.write("<li><a href=\"#diffAns-").reference(ctx.get("statId"),ctx,"h").write("\" data-toggle=\"tab\">Distinct Options</a></li>");}function body_5(chk,ctx){return chk.write("<li><a href=\"#asq-viz-tab-").reference(ctx.get("statId"),ctx,"h").write("\" data-toggle=\"tab\">Correctness</a></li>");}function body_6(chk,ctx){return chk.write("<div class=\"tab-pane active\" id='answersolutions-").reference(ctx.get("statId"),ctx,"h").write("'>").exists(ctx.getPath(false,["question","correctAnswer"]),ctx,{"else":body_7,"block":body_8},null).write("</div>");}function body_7(chk,ctx){return chk.partial("question-multi-choice-stats",ctx,null);}function body_8(chk,ctx){return chk.write("<p>Solution: ").reference(ctx.getPath(false,["question","correctAnswer"]),ctx,"h").write("</p><br/>");}function body_9(chk,ctx){return chk.write("<div class=\"tab-pane\" id=\"rvsw-").reference(ctx.get("statId"),ctx,"h").write("\"><div id=\"rvswChart\" class=\"rvswChart\" style=\"width: 100%; height: 500px;\"></div></div>");}function body_10(chk,ctx){return chk.write("<div class=\"tab-pane\" id=\"mscstats-").reference(ctx.get("statId"),ctx,"h").write("\"><div id=\"mscstatChart\" class=\"distinctAnswers\" style=\"height:500px\"></div></div>");}function body_11(chk,ctx){return chk.write("<div class=\"tab-pane\" id=\"diffAns-").reference(ctx.get("statId"),ctx,"h").write("\"><div id=\"diffAnsChart\" class=\"distinctOptions\" style=\"height:500px\"></div></div>");}function body_12(chk,ctx){return chk.write("<div class=\"tab-pane\" id=\"asq-viz-tab-").reference(ctx.get("statId"),ctx,"h").write("\"><div class=\"asq-viz-graph\" data-width=\"").reference(ctx.get("width"),ctx,"h").write("\" data-height=\"").reference(ctx.get("height"),ctx,"h").write("\" data-margin='").reference(ctx.get("margin"),ctx,"h",["s"]).write("'></div></div>");}return body_0;})();
	 // welcomeScreen-presenter.dust
	(function(){dust.register("welcomeScreen-presenter",body_0);function body_0(chk,ctx){return chk.write("<p><strong>Join this presentation:</strong></p><h3 class=\"slideshow-url\">").reference(ctx.get("presenterLiveUrl"),ctx,"h").write("</h3><div class=\"connected-viewers-icons\"></div><p class=\"connected-viewers-number\">Waiting for viewers</p>");}return body_0;})();
	 // welcomeScreen-viewer.dust
	(function(){dust.register("welcomeScreen-viewer",body_0);function body_0(chk,ctx){return chk.write("<h4>Connecting to http://").reference(ctx.get("host"),ctx,"h").write(":").reference(ctx.get("port"),ctx,"h").write("/live/").reference(ctx.get("user"),ctx,"h").write("/</h4>");}return body_0;})();
	// Returning object for nodejs
	return dust;
};
