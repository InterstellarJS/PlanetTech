import * as NODE      from 'three/nodes';
import * as THREE     from 'three';
import { CubeMap }    from '../cubeMap/cubeMap';
import * as Shaders  from  '../PlanetTech/shaders/index.js'

export function cubeMap (renderer_){
    let cubeMapDownload  = false
    const cubeMap = new CubeMap()
    cubeMap.build(3000,renderer_.renderer)
    cubeMap.simplexFbm({
        inScale:          7.0,
        scale_:           5.5,
        outScale:         0.3,
        seed_:            1.0,
        normalScale:      .08,
        redistribution_:   3.,
        persistance_:     .35,
        lacunarity_:       2.,
        iteration_:        15,
        terbulance_:    false,
        ridge_:         false,
    })
    cubeMap.simplexFbm({
        inScale:          7.0,
        scale_:           2.0,
        outScale:         1.0,
        seed_:            1.0,
        normalScale:      .08,
        redistribution_:   2.,
        persistance_:     .35,
        lacunarity_:       2.2,
        iteration_:        10,
        terbulance_:     false,
        ridge_:          false,
    },(current,pre)=>{
        let fcolor = NODE.mix(pre,current,.9)//current['add'](pre)
        let pos = NODE.positionLocal
        pos = pos.sub(NODE.vec3(0.0,0.0,1.))
        let grad = Shaders.blackToWhiteGradient({radius:0.5,vUv:pos})
       return fcolor.mul(grad)
    })
    cubeMap.snapShot(cubeMapDownload,{
        scale:    3.5,  
        epsilon: 0.0015,  
        strength:   1.,    
    })
    cubeMap.dispose()
    return cubeMap.textuerArray.map((canvas)=>{return new THREE.CanvasTexture(canvas)})
}

