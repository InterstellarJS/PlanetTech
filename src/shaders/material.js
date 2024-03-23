import * as THREE  from 'three'

import { 
snoise3D, 
noiseFunctions,
basisFunctions, 
terrainFunctions,
valueNoisefbm,
simplexNoisefbm,
valueNoise,
cellularNoisefbm,
Hermite3D_Derivfbm
} from './rawShaderFunctions';
import {Cellular3D_Deriv} from './noiseLib/Wombat/Cellular3D_Deriv';
import {Hermite3D_Deriv} from './noiseLib/Wombat/hermite3D_Deriv';
import { SimplexPerlin3D } from './noiseLib/Wombat/SimplexPerlin3D';
import { simplexPerlinNoiseFBm } from './rawShaderFunctions';

export class NormalMaterial{
    constructor(){
        this. combinedNoise = `
        vec4 combinedNoise(){
          vec4 noise;
          return noise;
        }
        `
       }


       getMaterial(worldSpace=true){
        const material =  new THREE.ShaderMaterial({
            uniforms: { offset: {value: new THREE.Vector3(1, 1, 1)},scale:{value:1}},
            vertexShader: `
            varying vec3 cubePosition;
            varying vec3 vNormal;

            void main() {
                cubePosition = (modelMatrix * vec4(position.xy, 1, 0)).xyz;
                vNormal      = normal;
                gl_Position  = vec4(position.xy, 0, 1);
            }
          `,
            fragmentShader: `
            uniform mat4 modelMatrix;
            varying vec3 cubePosition;
            varying vec3 vNormal;
            vec3 samplePos;
            uniform vec3 offset;
            uniform float scale;


            ${Hermite3D_Deriv}

            ${Hermite3D_Derivfbm}

            ${Cellular3D_Deriv}

            ${cellularNoisefbm}

            ${snoise3D}

            ${valueNoise}
            
            ${valueNoisefbm}

            ${simplexNoisefbm}

            ${basisFunctions}

            ${this.combinedNoise}

            ${terrainFunctions}

        
          void main() { 
            gl_FragColor = genTerrain(cubePosition, ${worldSpace}) * 0.5 + 0.5;
          }`
          });
          return material
      }


      simplexNoiseFBm(op=`+`,scale=1.,offset={x:1,y:1,z:1},persistence=.1, lacunarity=4.5, noiseOctaves=8) {
        const newNoiseCode = `
          noise ${op}= simplexNoisefbm((samplePos + vec3(${offset.x},${offset.y},${offset.z})) * float(${scale}), float(${persistence}), float(${lacunarity}),int(${noiseOctaves}));
        `;
        this.combinedNoise = this.combinedNoise.replace("vec4 noise;", "vec4 noise;");
        this.combinedNoise = this.combinedNoise.replace("return noise;", newNoiseCode + "\n  return noise;");
      }


      valueNoisefbm(op=`+`,scale=1.,offset={x:1,y:1,z:1},persistence=.1, lacunarity=4.5, noiseOctaves=8) {
        const newNoiseCode = `
          noise ${op}= valueNoisefbm((samplePos + vec3(${offset.x},${offset.y},${offset.z})) * float(${scale}), float(${persistence}), float(${lacunarity}),int(${noiseOctaves}));
        `;
        this.combinedNoise = this.combinedNoise.replace("vec4 noise;", "vec4 noise;");
        this.combinedNoise = this.combinedNoise.replace("return noise;", newNoiseCode + "\n  return noise;");
      }

      cellularNoisefbm(op=`+`,scale=1.,offset={x:1,y:1,z:1},persistence=.1, lacunarity=4.5, noiseOctaves=8){
        const newNoiseCode = `
        noise ${op}= cellularNoisefbm((samplePos + vec3(${offset.x},${offset.y},${offset.z})) * float(${scale}), float(${persistence}), float(${lacunarity}),int(${noiseOctaves}));
      `;
      this.combinedNoise = this.combinedNoise.replace("vec4 noise;", "vec4 noise;");
      this.combinedNoise = this.combinedNoise.replace("return noise;", newNoiseCode + "\n  return noise;");
      }


      hermite3D_Derivfbm(op=`+`,scale=1.,offset={x:1,y:1,z:1},persistence=.1, lacunarity=4.5, noiseOctaves=8){
        const newNoiseCode = `
        noise ${op}= Hermite3D_Derivfbm((samplePos + vec3(${offset.x},${offset.y},${offset.z})) * float(${scale}), float(${persistence}), float(${lacunarity}),int(${noiseOctaves}));
      `;
      this.combinedNoise = this.combinedNoise.replace("vec4 noise;", "vec4 noise;");
      this.combinedNoise = this.combinedNoise.replace("return noise;", newNoiseCode + "\n  return noise;");
      }


      simplexNoise() {
        const newNoiseCode = `
          noise += snoise(samplePos, vec3(0));
        `;
        this.combinedNoise = this.combinedNoise.replace("vec4 noise;", "vec4 noise;");
        this.combinedNoise = this.combinedNoise.replace("return noise;", newNoiseCode + "\n  return noise;");
      }


    yzw(y=`+0.`,z=`+0.`,w=`+0.`){
            const newNoiseCode = `
            noise.y = noise.y ${y};
            noise.z = noise.z ${z};
            noise.w = noise.w ${w};
            `;
            this.combinedNoise = this.combinedNoise.replace("vec4 noise;", "vec4 noise;");
            this.combinedNoise = this.combinedNoise.replace("return noise;", newNoiseCode + "\n  return noise;");
    }

    x(x=`+ 0.`){
        const newNoiseCode = `
        noise.x = noise.x ${x};
        `;
        this.combinedNoise = this.combinedNoise.replace("vec4 noise;", "vec4 noise;");
        this.combinedNoise = this.combinedNoise.replace("return noise;", newNoiseCode + "\n  return noise;");  
    }

      normalize() {
        const newNoiseCode = `
          noise = normalize(noise);
        `;
        this.combinedNoise = this.combinedNoise.replace("vec4 noise;", "vec4 noise;");
        this.combinedNoise = this.combinedNoise.replace("return noise;", newNoiseCode + "\n  return noise;");
      }


}


export class NoiseMaterial{
    constructor(){
        this. combinedNoise = `
        float combinedNoise(){
          float noise;
          return noise;
        }
        `


        this.terrainFunctions = `
        vec4 genTerrain(){

            vec3 tangent = modelMatrix[0].xyz;
            vec3 sphereNormal;
            sphereBasis(cubePosition, tangent, sphereNormal);
            
            samplePos = sphereNormal;

            float noise;
            noise = combinedNoise();
            return vec4(noise);
        }
        `
       }


       getMaterial(){
        const material =  new THREE.ShaderMaterial({
            uniforms: { offset: {value: new THREE.Vector3(1, 1, 1)},scale:{value:1}},
            vertexShader: `
            varying vec3 cubePosition;
            varying vec3 vNormal;

            void main() {
                cubePosition = (modelMatrix * vec4(position.xy, 1, 0)).xyz;
                vNormal      = normal;
                gl_Position  = vec4(position.xy, 0, 1);
            }
          `,
            fragmentShader: `
            uniform mat4 modelMatrix;
            varying vec3 cubePosition;
            varying vec3 vNormal;
            vec3 samplePos;
            uniform vec3 offset;
            uniform float scale;


            ${SimplexPerlin3D}

            ${simplexPerlinNoiseFBm}

            ${basisFunctions}

            ${this.combinedNoise}

            ${this.terrainFunctions}

        
          void main() { 
            gl_FragColor = genTerrain();
          }`
          });
          return material
      }



      simplexPerlinNoiseFBm(op=`+`,scale=1.,offset={x:1,y:1,z:1}, seed, persistance, lacunarity, redistribution, octaves,  iteration, terbulance,  ridge) {
        const newNoiseCode = `
          noise ${op}= simplexPerlinNoiseFBm((samplePos + vec3(${offset.x},${offset.y},${offset.z})) ,  float(${seed}),  float(${scale}),float(${persistance}),float(${lacunarity}) ,float(${redistribution}) ,int(${octaves}) , int(${iteration}) , ${terbulance},  ${ridge});
        `;
        this.combinedNoise = this.combinedNoise.replace("vec4 noise;", "vec4 noise;");
        this.combinedNoise = this.combinedNoise.replace("return noise;", newNoiseCode + "\n  return noise;");
      }

}