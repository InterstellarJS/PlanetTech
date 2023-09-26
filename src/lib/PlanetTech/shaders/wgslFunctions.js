import {wgslFn} from 'three/nodes';


export const defualtLight = wgslFn( `
fn defualtLight( normalMap:vec4<f32>, lightPosition:vec3<f32>, cP:vec3<f32> ) -> f32 {

    let lightDirection = normalize(lightPosition - normalMap.xyz);
    let viewDirection  = normalize(cP - normalMap.xyz);
    let ambientColor   = vec3<f32>(0.0, 0.0, 0.0);  // Ambient light color
    let diffuseColor   = vec3<f32>(0.5, 0.5, 0.5);  // Diffuse light color
    let specularColor  = vec3<f32>(0.0, 0.0, 0.0); // Specular light color
    let shininess      = 0.0;  // Material shininess factor
    
    let ambient = ambientColor;
    
    let diffuseIntensity = max(dot(normalMap.xyz, lightDirection), 0.0);
    let diffuse = diffuseColor * diffuseIntensity;
    
    let reflectionDirection = reflect(-lightDirection, normalMap.xyz);
    let specularIntensity = pow(max(dot(reflectionDirection, viewDirection), 0.0), shininess);
    let specular = specularColor * specularIntensity;
    
    let finalColor = ambient + diffuse + specular;
    return clamp(dot(normalMap.xyz, lightDirection), 0.0, 1.0) * max(max(finalColor.r, finalColor.g), finalColor.b);

}
` );
