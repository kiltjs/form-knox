"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _formKnox = _interopRequireDefault(require("./form-knox"));

var _input = _interopRequireDefault(require("./input"));

var _env = _interopRequireDefault(require("./env"));

var _mask = _interopRequireDefault(require("./mask"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var bundle = (0, _env.default)(_formKnox.default, _mask.default);
bundle.initInput = _input.default;
var _default = bundle;
exports.default = _default;
module.exports = exports.default;