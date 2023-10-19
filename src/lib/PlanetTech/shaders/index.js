import renderer          from '../../render.js';
import * as glslFunctions from './glslFunctions.js';
import * as wgslFunctions from './wgslFunctions.js';

let defualtLight;
let snoise3D;
let snoise3Dfbm
let displacementFBM
let snoise3DDisplacementNormalFBM
let pattern
let displacementNoiseFBMWarp
let displacementNormalNoiseFBMWarp
let blackToWhiteGradient
let whiteToBlackGradient 
let RGBMod 
let uvTransforms 




if (renderer.getType() === 'WebGL') {
    console.log('WebGL');
    defualtLight  = glslFunctions.defualtLight;
    snoise3D      = glslFunctions.snoise3D;
    snoise3Dfbm   = glslFunctions.snoise3Dfbm;
    snoise3DDisplacementNormalFBM = glslFunctions.snoise3DDisplacementNormalFBM;
    displacementNoiseFBMWarp = glslFunctions.displacementNoiseFBMWarp
    displacementNormalNoiseFBMWarp = glslFunctions.displacementNormalNoiseFBMWarp
    pattern = glslFunctions.pattern
    displacementFBM = glslFunctions.displacementFBM
    blackToWhiteGradient = glslFunctions.blackToWhiteGradient
    whiteToBlackGradient = glslFunctions.whiteToBlackGradient
    RGBMod = glslFunctions.RGBMod
    uvTransforms = glslFunctions.uvTransforms

} else if (renderer.getType() === 'WebGPU') {
    console.log('WebGPU');
    defualtLight = wgslFunctions.defualtLight;
    snoise3D     = wgslFunctions.snoise3D;
    //snoise3DDisplacementNormalFBM = wgslFunctions.snoise3DDisplacementNormalFBM;
    //displacementNoiseFBMWarp = wgslFunctions.displacementNoiseFBMWarp
    //displacementNormalNoiseFBMWarp = wgslFunctions.displacementNormalNoiseFBMWarp
    //pattern = wgslFunctions.pattern
    //displacementFBM = wgslFunctions.displacementFBM
}

export { 
    defualtLight,
    snoise3D,
    snoise3Dfbm,
    displacementFBM,
    snoise3DDisplacementNormalFBM,
    pattern,
    displacementNoiseFBMWarp,
    displacementNormalNoiseFBMWarp,
    blackToWhiteGradient,
    whiteToBlackGradient, 
    RGBMod, 
    uvTransforms, 
};