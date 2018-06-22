'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _formKnox = require('./form-knox');

var _formKnox2 = _interopRequireDefault(_formKnox);

var _input = require('./input');

var _input2 = _interopRequireDefault(_input);

var _env = require('./env');

var _env2 = _interopRequireDefault(_env);

var _mask = require('./mask');

var _mask2 = _interopRequireDefault(_mask);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var bundle = (0, _env2.default)(_formKnox2.default, _mask2.default);

bundle.initInput = _input2.default;

exports.default = bundle;