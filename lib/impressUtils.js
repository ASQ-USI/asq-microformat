function makeAssessmentGridsTogglable(){
  $('.asq-assess-grid').hide();
  $('.asq-assess-grid-holder').prepend('<a class="asq-assess-grid-toggle" style="font-size: 0.625em;" href="#">Show assessment grid</a>');
  $(document).on('click', '.asq-assess-grid-toggle', function(e){
    e.preventDefault();
    this.innerHTML = (this.innerHTML == "Show assessment grid" )
      ? "Show questions" 
      : "Show assessment grid";
    $(this).closest('.asq-exercise').find('.asq-question').toggle();
    $(this).closest('.asq-assess-grid-holder').find('.asq-assess-grid').toggle();
  });
}

module.exports = {
  makeAssessmentGridsTogglable : makeAssessmentGridsTogglable
}
