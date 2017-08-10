import vex from 'vex-js';
import vexDialog from 'vex-dialog';
import 'vex-js/dist/css/vex.css';
import 'vex-js/dist/css/vex-theme-plain.css';

vex.registerPlugin(vexDialog);

vex.defaultOptions.className = 'vex-theme-plain';

export default vex;