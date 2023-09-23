import * as NODE from 'three/nodes';
import {glslFn} from 'three/nodes';

export const light = glslFn(`
  float light(vec4 normalMap, vec3 lightPosition, vec3 cP) {
    vec3 lightDirection = normalize(lightPosition - normalMap.xyz);
    vec3 viewDirection  = normalize(cP - normalMap.xyz);
    vec3 ambientColor   = vec3(0.0, 0.0, 0.0);  // Ambient light color
    vec3 diffuseColor   = vec3(0.2, 0.2, 0.2);  // Diffuse light color
    vec3 specularColor  = vec3(0.0, 0.0, 0.0);  // Specular light color
    float shininess     = 0.0;                  // Material shininess factor

    // Ambient lighting calculation
    vec3 ambient = ambientColor;

    // Diffuse lighting calculation
    float diffuseIntensity = max(dot(normalMap.xyz, lightDirection), 0.0);
    vec3 diffuse = diffuseColor * diffuseIntensity;

    // Specular lighting calculation
    vec3 reflectionDirection = reflect(-lightDirection, normalMap.xyz);
    float specularIntensity = pow(max(dot(reflectionDirection, viewDirection), 0.0), shininess);
    vec3 specular = specularColor * specularIntensity;

    // Final lighting calculation
    vec3 finalColor = ambient + diffuse + specular;
    return clamp(dot(normalMap.xyz, lightDirection), 0.0, 1.0) * max(max(finalColor.r, finalColor.g), finalColor.b);
  }
`)



