var fs             = require('fs')
  , sugar          = require('sugar')
  , chai           = require('chai')
  , Parser         = require('../lib/parser')
  , asqParser      = new Parser()
  , expectedMC     = require('./fixtures/multiple-choice')
  , expectedTI     = require('./fixtures/text-input')
  , cheerio        = require('cheerio')
  , expect         = chai.expect;

describe('AsqParser', function() {

  // assets for multi-choice
  var mCHtml = fs.readFileSync( __dirname + "/fixtures/multiple-choice.html", 'utf8' ),
    htmlMCString    = cheerio.load( mCHtml ).html(),
  //assets for multi-choice without id
    mCNoIDHtml = fs.readFileSync( __dirname + "/fixtures/multiple-choice-no-id.html", 'utf8' ),
    htmlMCNoIDString    = cheerio.load( mCNoIDHtml ).html(),
  //assets for text-input
    tIHtml = fs.readFileSync( __dirname + "/fixtures/text-input.html", 'utf8' ),
    htmlTIString    = cheerio.load( tIHtml ).html(),
  //assets for text-input without id
    tINoIDHtml = fs.readFileSync( __dirname + "/fixtures/text-input-no-id.html", 'utf8' ),
    htmlTINoIDString    = cheerio.load( tINoIDHtml ).html();

   //callback tests for multi-choice questions
  describe('.parse() for multi-choice', function(){

    it.skip("should have tested options");

    it("should return an object that matches the reference object", function(){
     var parsed = asqParser.parse(htmlMCString, {outputFormat:'Object'});      
     console.dir(parsed.html)
      expect(parsed.questions).to.deep.equals(expectedMC.questions);
    }); 

    it("should return an error when there are is a question without id", function(){
      var parsed = asqParser.parse(htmlMCNoIDString)
      expect(parsed.errors).to.not.be.empty;
    });
    it("should return null data when there are is a question without id", function(){
      var parsed = asqParser.parse(htmlMCNoIDString)
      expect(parsed.questions).to.not.exist;
    }); 
  });

  // //callback tests for text-input questions
  describe('.parse for text-input', function(){
    it("should return an object that matches the reference object", function(){
      var parsed = asqParser.parse(htmlTIString, {outputFormat:'Object'})
      expect(parsed.questions).to.deep.equals(expectedTI.questions)
    });

    it("should return an error when there are is a question without id", function(){
      var parsed = asqParser.parse(htmlTINoIDString)
      expect(parsed.errors).to.not.be.empty;
    });
    it("should return null data when there are is a question without id", function(){
      var parsed = asqParser.parse(htmlTINoIDString)
      expect(parsed.questions).to.not.exist;
    });
  });
});
