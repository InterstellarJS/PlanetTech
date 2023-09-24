import renderer          from '../../render.js';
import * as glslFunctions from './glslFunctions.js';
import * as wgslFunctions from './wgslFunctions.js';

let light;

if (renderer.getType() === 'WebGL') {
    console.log('WebGL');
    light = glslFunctions.light;
} else if (renderer.getType() === 'WebGPU') {
    console.log('WebGPU');
    light = wgslFunctions.light;
}

export { 
    light 
};