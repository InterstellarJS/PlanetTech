import renderer          from '../../render.js';
import * as glslFunctions from './glslFunctions.js';
import * as wgslFunctions from './wgslFunctions.js';

let defualtLight;

if (renderer.getType() === 'WebGL') {
    console.log('WebGL');
    defualtLight = glslFunctions.defualtLight;
} else if (renderer.getType() === 'WebGPU') {
    console.log('WebGPU');
    defualtLight = wgslFunctions.defualtLight;
}

export { 
    defualtLight 
};