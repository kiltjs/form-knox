
import formKnox from './form-knox';
import initInput from './input';
import initEnv from './env';
import mask from './mask';

var bundle = initEnv(formKnox, mask);

bundle.initInput = initInput;

export default bundle;
