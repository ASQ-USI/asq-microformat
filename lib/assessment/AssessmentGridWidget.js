var _ = require('lodash');

function isInt(n) {
   return typeof n === 'number' && n % 1 == 0;
}

function isElement(obj) {
  try {
    //Using W3 DOM2 (works for FF, Opera and Chrom)
    return obj instanceof HTMLElement;
  }
  catch(e){
    //Browsers not supporting W3 DOM2 don't have HTMLElement and
    //an exception is thrown and we end up here. Testing some
    //properties that all elements have. (works on IE7)
    return (typeof obj==="object") &&
      (obj.nodeType===1) && (typeof obj.style === "object") &&
      (typeof obj.ownerDocument ==="object");
  }
}

function AssessmentGridWidget (container, opts){
  this.users = Object.create(null);
  this.options = {gradeStyle: "led", users: [] };
  _.extend(this.options, opts)
  
  this.init(container, this.options.users);
}

(function(){
  this.init = function(container, users){
    if(! isElement(container)){
      throw new Error('container should be a DOM element');  
    }

    this.el = document.createElement("table");
    this.el.className = "asq-assess-grid";
    this.el.attributes['role'] = "presentation";
    
    this.colgroup = document.createElement("colgroup");
    this.colgroup.appendChild(document.createElement("col"))

    this.theadRow = document.createElement("tr");
    var th = document.createElement("th");
    th.className = "asq-diagonal-cell";
    th.innerHTML = 'assessor<div class="verticalText">assesse</div>';    
    this.thead = document.createElement("thead");
    this.theadRow.appendChild(th);
    this.thead.appendChild(this.theadRow);

    this.tbody = document.createElement("tbody");
    this.el.appendChild(this.colgroup);
    this.el.appendChild(this.thead);
    this.el.appendChild(this.tbody);
    
    if(users) this.addUsers(users);

    container.appendChild(this.el);
  }
  
  this.addUsers = function(users){
    for (var i = 0, l= users.length; i < l; i++) {
      if(!this.users[users[i].token]){
       this.addUser(users[i]);
 
      }else{
        console.log("Tried to add an already existing user %s", user[i].name)
      }
    }   
  }

  this.addUser = function(newUser){
    this.users[newUser.token] = newUser;
    
    //create head cell
    var th = document.createElement("th");
    th.dataset.userToken = newUser.token;
    th.innerHTML='<div class="verticalText">' + newUser.nickname + '</div>' 
    this.theadRow.appendChild(th);

    //before insert new row, add missing cell to previous rows
    var existingRows = this.tbody.rows;
    for (var i = 0, l = existingRows.length; i < l; i++){
      existingRows[i].insertCell(-1);
    }

    //create new col
    var newCol = document.createElement("col");
    newCol.className="new-col";

    if(this.options.gradeStyle === "hue"){
      newCol.dataset.hue = ~~((360/25)* ((this.colgroup.childNodes.length -1)%26));
    }
    
    
    //create row
    var newRow = document.createElement("tr");
    newRow.className="new-row";
    newRow.dataset.userToken = newUser.token;
    var currentCell = document.createElement("td");
    var currentText = document.createTextNode(newUser.nickname);        
    currentCell.appendChild(currentText);
    newRow.appendChild(currentCell);

    for(var key in this.users){
      currentCell = newRow.insertCell(-1);
    }
    //the last currentCell is the diagonal one
    currentCell.className = "asq-diagonal-cell";

    //now add col and row for sync animation effect
    this.colgroup.appendChild(newCol);
    this.tbody.appendChild(newRow);

    setTimeout(function(){
      newRow.className = newCol.className = ''
    }, 4000)
  }

  this.removeUser = function(user2Remove){

    if(!this.users[user2Remove.token]){
      throw new Error("User " + user2Remove.token + " doesn't exist");
    }

    var row = this.tbody.querySelector('[data-user-token="'+ user2Remove.token +'"]');
    row.className="to-be-removed-row";
    var index = row.rowIndex;
    var col = this.colgroup.childNodes[index];
    col.className="to-be-removed-col";
   

    setTimeout(function(){
      this.el.deleteRow(index);

      //remove nick for thead
      this.theadRow.deleteCell(index);

      //remove corresponding cell for the rest of the rows
      var existingRows = this.tbody.rows;
      for (var i = 0, l = existingRows.length; i < l; i++){
        existingRows[i].deleteCell(index);
      }

      //remove column
      this.colgroup.removeChild(col);

    }.bind(this), 4000);
   
  }

  this.setToNowAssessing = function(assessorToken, assesseeToken){
    this.checkTokens(assessorToken, assesseeToken);
    var row = this.tbody.querySelector('[data-user-token="'+ assessorToken +'"]');
    var cellIndex =  this.thead.querySelector('[data-user-token="'+ assesseeToken +'"]').cellIndex;
    row.cells[cellIndex].innerHTML='<div class="asq-led asq-led-blue active"><div>';
  }

  this.setToIdle = function(assessorToken, assesseeToken){
    this.checkTokens(assessorToken, assesseeToken);
    var row = this.tbody.querySelector('[data-user-token="'+ assessorToken +'"]');
    var cellIndex =  this.thead.querySelector('[data-user-token="'+ assesseeToken +'"]').cellIndex;
    var led = row.cells[cellIndex].querySelector('.asq-led');

    if(led){
      led.className="asq-led asq-led-blue";
    }
    else{
      row.cells[cellIndex].innerHTML='<div class="asq-led asq-led-blue"><div>';
    } 
  }

  this.setGrade = function(assessorToken, assesseeToken, grade){
    this.checkTokens(assessorToken, assesseeToken);
    if("undefined" === typeof grade || ! isInt(grade) || grade > 100 || grade < 0) {
      throw new Error("third argument should exist and be an Integer between 0-100");
    }
    var row = this.tbody.querySelector('[data-user-token="'+ assessorToken +'"]');
    var cellIndex =  this.thead.querySelector('[data-user-token="'+ assesseeToken +'"]').cellIndex;

    if(this.options.gradeStyle === "led"){
      var led = row.cells[cellIndex].querySelector('.asq-led');
      if(led) {
        led.className="asq-led asq-led-grade-" + (~~grade).toString();
      }else{
        row.cells[cellIndex].innerHTML='<div class="asq-led asq-led-grade-' + (~~grade).toString() + '"><div>';
      }

    }else if(this.options.gradeStyle === "hue"){
      var hue = parseInt(this.colgroup.childNodes[cellIndex].dataset.hue);
      var l = 10 + ~~(grade * 0.8);
      row.cells[cellIndex].innerHTML = "";
      row.cells[cellIndex].style.backgroundColor = "hsl(" + hue + ", 100%," + l + "%)";
    }   
  }

  this.checkTokens = function(assessorToken, assesseeToken){
    if(! this.users[assessorToken]) {
      throw new Error("user with token " + assessorToken + " doesn't exist");
    }
    if(! this.users[assesseeToken]) {
      throw new Error("user with token " + assesseeToken + " doesn't exist");
    }
  }
  
}).call(AssessmentGridWidget.prototype);

module.exports = AssessmentGridWidget;