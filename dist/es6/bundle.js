
import formKnox from './form-knox';
import input from './input';
import mask from './mask';

formKnox.input = input;
formKnox.mask = mask;

export default formKnox(formKnox, mask);
