/** @module index
    @description Exposes the main files
*/
module.exports = {
  parser    : require('./lib/parser'),
	generator : require('./lib/markupGenerator')
  assessment: require('./lib/assessment')
}
