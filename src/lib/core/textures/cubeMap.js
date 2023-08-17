
import * as THREE  from 'three'
import {RtTexture} from './rTtexture'
import renderer_    from '../../render'
import * as NODE   from 'three/nodes';
import { snoise3D, noiseFunctions,basisFunctions, terrainFunctions,valueNoisefbm,simplexNoisefbm,valueNoise,cellularNoisefbm,Hermite3D_Derivfbm} from '../shaders/rawShaderFunctions';
import {combinedNoise_} from '../shaders/rawShaderFunctions';
import {Cellular3D_Deriv} from '../shaders/noiseLib/Wombat/Cellular3D_Deriv';
import {Hermite3D_Deriv} from '../shaders/noiseLib/Wombat/hermite3D_Deriv';

let combinedNoise = combinedNoise_()

  const cubeFaceOrientations = [
    new THREE.Euler(0, Math.PI/2, 0),
    new THREE.Euler(0, -Math.PI/2, 0),
    new THREE.Euler(-Math.PI/2, 0, 0),
    new THREE.Euler(Math.PI/2, 0, 0),
    new THREE.Euler(0, 0, 0),
    new THREE.Euler(0, Math.PI, 0)
  ];
  
 
let offset = new THREE.Vector3(1, 1, 1)
var scale = 1


export class CubeMap{
    constructor(){
        this.textuerArray = []
       }
       

    buildRttMesh(worldSpace=true){
        const geometry = new THREE.PlaneGeometry( 2,2,1,1);
        const material =  new THREE.ShaderMaterial({
            uniforms: { offset: {value: offset},scale:{value:scale}},
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

            ${combinedNoise}

            ${terrainFunctions}

        
          void main() { 
            gl_FragColor = genTerrain(cubePosition, ${worldSpace}) * 0.5 + 0.5;
          }`
          });
        this. quad = new THREE.Mesh( geometry, material );
      }

      valueNoisefbm(op=`+`,scale=1.,offset={x:1,y:1,z:1},persistence=.1, lacunarity=4.5, noiseOctaves=8) {
        const newNoiseCode = `
          noise ${op}= valueNoisefbm((samplePos + vec3(${offset.x},${offset.y},${offset.z})) * float(${scale}), float(${persistence}), float(${lacunarity}),int(${noiseOctaves}));
        `;
        combinedNoise = combinedNoise.replace("vec4 noise;", "vec4 noise;");
        combinedNoise = combinedNoise.replace("return noise;", newNoiseCode + "\n  return noise;");
      }

      cellularNoisefbm(op=`+`,scale=1.,offset={x:1,y:1,z:1},persistence=.1, lacunarity=4.5, noiseOctaves=8){
        const newNoiseCode = `
        noise ${op}= cellularNoisefbm((samplePos + vec3(${offset.x},${offset.y},${offset.z})) * float(${scale}), float(${persistence}), float(${lacunarity}),int(${noiseOctaves}));
      `;
      combinedNoise = combinedNoise.replace("vec4 noise;", "vec4 noise;");
      combinedNoise = combinedNoise.replace("return noise;", newNoiseCode + "\n  return noise;");
      }


      hermite3D_Derivfbm(op=`+`,scale=1.,offset={x:1,y:1,z:1},persistence=.1, lacunarity=4.5, noiseOctaves=8){
        const newNoiseCode = `
        noise ${op}= Hermite3D_Derivfbm((samplePos + vec3(${offset.x},${offset.y},${offset.z})) * float(${scale}), float(${persistence}), float(${lacunarity}),int(${noiseOctaves}));
      `;
      combinedNoise = combinedNoise.replace("vec4 noise;", "vec4 noise;");
      combinedNoise = combinedNoise.replace("return noise;", newNoiseCode + "\n  return noise;");
      }




      simplexNoise() {
        const newNoiseCode = `
          noise += snoise(samplePos, vec3(0));
        `;
        combinedNoise = combinedNoise.replace("vec4 noise;", "vec4 noise;");
        combinedNoise = combinedNoise.replace("return noise;", newNoiseCode + "\n  return noise;");
      }

      simplexNoiseFBm(op=`+`,scale=1.,offset={x:1,y:1,z:1},persistence=.1, lacunarity=4.5, noiseOctaves=8) {
        const newNoiseCode = `
          noise ${op}= simplexNoisefbm((samplePos + vec3(${offset.x},${offset.y},${offset.z})) * float(${scale}), float(${persistence}), float(${lacunarity}),int(${noiseOctaves}));
        `;
        combinedNoise = combinedNoise.replace("vec4 noise;", "vec4 noise;");
        combinedNoise = combinedNoise.replace("return noise;", newNoiseCode + "\n  return noise;");
      }

      normalize() {
        const newNoiseCode = `
          noise = normalize(noise);
        `;
        combinedNoise = combinedNoise.replace("vec4 noise;", "vec4 noise;");
        combinedNoise = combinedNoise.replace("return noise;", newNoiseCode + "\n  return noise;");
      }


    complie(textureResolution=512,download=false){
        this.rtt = new RtTexture(textureResolution)
        this.rtt.initRenderTraget()
        this.rtt.rtCamera.position.z = 1;
        this.rtt.rtScene.add(this.quad)
        for (let i = 0; i < 6; i++) {
            this.quad.rotation.copy(cubeFaceOrientations[i]);
            const target = new THREE.WebGLRenderTarget(
                this.rtt.rtWidth, 
                this.rtt.rtHeight, 
                {
                generateMipmaps: true, 
                depthBuffer: false,
                stencilBuffer: false
            });
            this.rtt.renderTarget = target //over write defualt render traget 
            this.rtt.snapShot(renderer_)
            if(download){
                let pixels = this.rtt.getPixels(renderer_)
                let canvas = this.rtt.toImage(pixels)
                this.rtt.download(canvas,i)
            }
            const texture = this.rtt.getTexture();
            this.textuerArray[i] = texture;
          }

    }
  



   

    
}