/** @module index
    @description Exposes the main files
*/

module.exports = {
  assessment : require('./lib/assessment'),
  generator  : require('./lib/markupGenerator'),
  parser     : require('./lib/parser'),
  templates  : require('./dusts/compiled/templates')
}
