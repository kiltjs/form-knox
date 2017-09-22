
var formKnox = require('./form-knox'),
    input = require('./input'),
    mask = require('./mask');

formKnox.input = input;
formKnox.mask = mask;

module.exports = formKnox(formKnox, mask);
