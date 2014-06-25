/** @module index
    @description Exposes the main files
*/

module.exports = {
  client : require('./lib/client'),
  generator  : require('./lib/markupGenerator'),
  parser     : require('./lib/parser'),
  templates  : require('./dusts/compiled/templates')
}
