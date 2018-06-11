
var formKnox = require('./form-knox');
var input = require('./input');
var mask = require('./mask');

formKnox.input = input;
formKnox.mask = mask;

module.exports = formKnox(formKnox, mask);
