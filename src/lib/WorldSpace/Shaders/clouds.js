import * as THREE from "three";
import {
  SMAAEffect,
  BlendFunction,
  Effect,
  EffectComposer,
  RenderPass,
  EffectPass,
  EffectAttribute,
  WebGLExtension,
} from "postprocessing";
import { Uniform, HalfFloatType } from "three";
import renderer from "../../render";

// 3D FBM noise https://shadertoy.com/view/lss3zr
export const vertexShader = /* glsl */ `
varying vec2 vUv;
varying vec2 pos;
void main() {
vUv = uv;
pos = position.xy;
gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0 );
}`;

export const fbm = /* glsl */ `
  mat3 m = mat3(0.00, 0.80, 0.60, -0.80, 0.36, -0.48, -0.60, -0.48, 0.64);
  float hash(float n) {
    return fract(sin(n) * 43758.5453);
  }

  float noise(vec3 x) {
    vec3 p = floor(x);
    vec3 f = fract(x);

    f = f * f * (3.0 - 2.0 * f);

    float n = p.x + p.y * 57.0 + 113.0 * p.z;

    float res = mix(mix(mix(hash(n + 0.0), hash(n + 1.0), f.x),
                        mix(hash(n + 57.0), hash(n + 58.0), f.x), f.y),
                    mix(mix(hash(n + 113.0), hash(n + 114.0), f.x),
                        mix(hash(n + 170.0), hash(n + 171.0), f.x), f.y), f.z);
    return res;
  }

  float fbm(vec3 p) {
    float f = 0.0;
    f += 0.5000 * noise(p); p = m * p * 2.02;
    f += 0.2500 * noise(p); p = m * p * 2.03;
    f += 0.12500 * noise(p); p = m * p * 2.01;
    f += 0.06250 * noise(p);
    return f;
  }
`;

export const fragmentShader = /* glsl */ `
  uniform vec3 uCloudSize;
  uniform vec3 uSunPosition;
  uniform vec3 uCameraPosition;
  uniform vec3 uCloudColor;
  uniform vec3 uSkyColor;
  uniform float uCloudSteps;
  uniform float uShadowSteps;
  uniform float uCloudLength;
  uniform float uShadowLength;
  uniform vec2 uResolution;
  uniform mat4 inverseProjection;
  uniform mat4 inverseView;
  uniform float uTime;
  uniform bool uRegress;
  uniform vec3  uCameraDir;


  ${fbm}

  vec3 _ScreenToWorld(vec3 posS) {
    vec2 uv = posS.xy;
    float z = posS.z;
    float nearZ = 0.01;
    float farZ = cameraFar;
    float depth = pow(2.0, z * log2(farZ + 1.0)) - 1.0;
      vec3 direction = (inverseProjection * vec4(vUv * 2.0 - 1.0, 0.0, 1.0)).xyz;
      direction = (inverseView * vec4(direction, 0.0)).xyz;
      direction = normalize(direction);
    direction /= dot(direction, uCameraDir);
    return uCameraPosition + direction * depth;
  }


  float differenceSDF(float distA, float distB) {
    return max(distA, -distB);
}

  float cloudDepth(vec3 position) {
    float e1 = length(position * uCloudSize)-80000.0;
    float e2 = length(position * uCloudSize)-100000.0;
    float ellipse = differenceSDF(e1,e2);
    float cloud = -ellipse + fbm(position) * 80000.5;
    return min(max(0.0, cloud), 1.0);
  }

  // https://shaderbits.com/blog/creating-volumetric-ray-marcher
  vec4 cloudMarch(float jitter, vec3 position, vec3 ray, float d) {
    float stepLength = uCloudLength / uCloudSteps;
    float shadowStepLength = uShadowLength / uShadowSteps;

    vec3 lightDirection = normalize(uSunPosition);
    vec3 cloudPosition = position + ray * jitter * stepLength;

    vec4 color = vec4(0.0, 0.0, 0.0, d);

    for (float i = 0.0; i < uCloudSteps; i++) {
      if (color.a < 0.6) break;

      float depth = cloudDepth(cloudPosition);
      if (depth > 0.001) {
        vec3 lightPosition = cloudPosition + lightDirection * jitter * shadowStepLength;

        float shadow = 0.0;
        for (float s = 0.0; s < uShadowSteps; s++) {
          lightPosition += lightDirection * shadowStepLength;
          shadow += cloudDepth(lightPosition);
        }
        shadow = exp((-shadow / uShadowSteps) * 3.0);

        float density = clamp((depth / uCloudSteps) * 15.0, 0.0, 1.0);
        color.rgb += vec3(shadow * density) * uCloudColor * color.a;
        color.a *= 1.0 - density;

        color.rgb += density * uSkyColor * color.a;
      }

      cloudPosition += ray * stepLength;
    }

    return color;
  }


  void mainImage(const in vec4 inputColor, const in vec2 uv, const in float depth, out vec4 outputColor) {

    float d           = texture2D(depthBuffer, uv).x;
    vec3 posWS        = _ScreenToWorld(vec3(uv, d));
    vec3 rayOrigin    = uCameraPosition;
    vec3 rayDirection = normalize(posWS - uCameraPosition);
    float sceneDepth  = length(posWS.xyz - uCameraPosition);
    vec3 addColor     = inputColor.xyz;

    vec3 ro = rayOrigin;
    vec3 rd = rayDirection;
    
    vec4 color = cloudMarch(0.0, ro, rd, d);
    outputColor = vec4((color.rgb) + uSkyColor* color.a, 1.0)+inputColor; // <---with previous scene
    //outputColor = vec4(color.rgb + uSkyColor * color.a, 1.0);  // <---without previous scene
  }

`;



const cameraDir = new THREE.Vector3();

class Clouds {
  constructor() {}

  createcomposer(params) {
    class CustomEffect extends Effect {
      constructor(camera) {
        renderer.camera_.getWorldDirection(cameraDir);
        super("CustomEffect", fragmentShader, {
          uniforms: new Map([
            ["uCameraPosition",   new Uniform(renderer.camera_.position)],
            ["inverseProjection", new Uniform(renderer.camera_.projectionMatrixInverse)],
            ["inverseView",       new Uniform(renderer.camera_.matrixWorld)],
            ["uCameraDir",        new Uniform(cameraDir)],

            ["uCloudSize", new Uniform(new THREE.Vector3(0.5, 0.5, 0.5))],
            ["uSunPosition", new Uniform(new THREE.Vector3(1.0, 2.0, 1.0))],
            ["uCloudColor", new Uniform(new THREE.Color(0xeabf6b))],
            ["uSkyColor", new Uniform(new THREE.Color('black'))],

            ["uCloudSteps", new Uniform(12)],
            ["uShadowSteps", new Uniform(8)],
            ["uCloudLength", new Uniform(16)],
            ["uShadowLength", new Uniform(2)],
            ["noise", new Uniform(false)],
            ["uRegress", new Uniform(false)],
            ["uResolution", new Uniform(new THREE.Vector2())],
            ["uTime", new Uniform(0)],
          ]),
          attributes: EffectAttribute.DEPTH,
          extensions: new Set([WebGLExtension.DERIVATIVES]),
        });
      }
    }
    this.depthPass = new CustomEffect(renderer.camera_);
  }

  run() {
    renderer.camera_.getWorldDirection(cameraDir);
    this.depthPass.uniforms.get("uCameraPosition")  .value = renderer.camera_.position;
    this.depthPass.uniforms.get("inverseProjection").value = renderer.camera_.projectionMatrixInverse;
    this.depthPass.uniforms.get("inverseView")      .value = renderer.camera_.matrixWorld;
    this.depthPass.uniforms.get("uCameraDir")       .value = cameraDir;
  }
}

export default Clouds;
