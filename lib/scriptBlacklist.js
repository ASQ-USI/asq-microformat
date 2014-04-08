/** @module lib/scriptBlacklist
    @description Regexes of scripts that we want removed
*/


// This is to be used as part of a regex
// we escape twice because first it will be converted to string
module.exports = [
 'jquery(|\\.min)\\.js' ,
 'bootstrap(|\\.min)\\.js'
 ]