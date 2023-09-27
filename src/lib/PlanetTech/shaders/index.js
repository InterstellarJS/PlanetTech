import renderer          from '../../render.js';
import * as glslFunctions from './glslFunctions.js';
import * as wgslFunctions from './wgslFunctions.js';

let defualtLight;
let snoise3D;

if (renderer.getType() === 'WebGL') {
    console.log('WebGL');
    defualtLight = glslFunctions.defualtLight;
    snoise3D     = glslFunctions.snoise3D
} else if (renderer.getType() === 'WebGPU') {
    console.log('WebGPU');
    defualtLight = wgslFunctions.defualtLight;
    snoise3D     = wgslFunctions.snoise3D;
}

export { 
    defualtLight,
    snoise3D, 
};