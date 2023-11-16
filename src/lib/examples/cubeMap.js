import * as NODE      from 'three/nodes';
import * as THREE     from 'three';
import { CubeMap }    from '../cubeMap/cubeMap';
import { TileMap }    from '../cubeMap/tileMap';


export function cubeMap (renderer_){
    let cubeMapDownload  = false
    const cubeMap = new CubeMap()
    cubeMap.build(3000,renderer_.renderer)
    cubeMap.simplexFbm({
        inScale:          0.4,
        scale_:           2.0,
        seed_:            6.0,
        normalScale:      .08,
        redistribution_:   2.,
        persistance_:     .4,
        lacunarity_:       2.,
        iteration_:        15,
        terbulance_:    false,
        ridge_:         false,
    })
    /*cubeMap.simplexFbm({
        inScale:             1.5,
        scale_:              0.5,
        seed_:               0.0,
        normalScale:        .08,
        redistribution_:      4.,
        persistance_:        .35,
        lacunarity_:          3.,
        iteration_:           15,
        terbulance_:        true,
        ridge_:            false,
    },
    (previous,current)=>{
        current = NODE.float(1).sub(current)
        let t1  = NODE.mix(current,previous,previous)
        return t1  
    })*/
    cubeMap.snapShot(cubeMapDownload,{
        scale:    1.25,  
        epsilon: 0.025,  
        strength:   2.,    
    })
    cubeMap.dispose()
    let cN = cubeMap.textuerArray.map((canvas)=>{return new THREE.CanvasTexture(canvas)})
    return cN
}

export function cubeMapRight(renderer_){
    let cubeMapDownload  = false
    const cubeMap = new CubeMap(true)
    cubeMap.build(3000,renderer_.renderer)
    cubeMap.simplexFbm({
        inScale:          8.5,
        scale_:           5.5,
        seed_:            6.0,
        normalScale:      .08,
        redistribution_:   5.,
        persistance_:     .35,
        lacunarity_:       2.,
        iteration_:        10,
        terbulance_:    false,
        ridge_:         false,
    })

    cubeMap.simplexFbm({
        inScale:             1.5,
        scale_:              0.5,
        seed_:               0.0,
        normalScale:        .08,
        redistribution_:      4.,
        persistance_:        .35,
        lacunarity_:          3.,
        iteration_:           15,
        terbulance_:        true,
        ridge_:            false,
    },
    (previous,current)=>{
        current = NODE.float(1).sub(current)
        let t1  = NODE.mix(current,previous,previous)
        return t1  
    })
    cubeMap.toNormal({
        scale:    2.25,  
        epsilon: 0.0008,  
        strength:   1.,    
    })
    cubeMap.snapShotRight(cubeMapDownload)
    cubeMap.dispose()
    let cN = cubeMap.textuerArray.map((canvas)=>{return new THREE.CanvasTexture(canvas)})
    return cN
}

export function cubeMapLeft(renderer_){
    let cubeMapDownload  = false
    const cubeMap = new CubeMap(true)
    cubeMap.build(3000,renderer_.renderer)
    cubeMap.simplexFbm({
        inScale:          8.5,
        scale_:           5.5,
        seed_:            6.0,
        normalScale:      .08,
        redistribution_:   5.,
        persistance_:     .35,
        lacunarity_:       2.,
        iteration_:        10,
        terbulance_:    false,
        ridge_:         false,
    })

    cubeMap.simplexFbm({
        inScale:             1.5,
        scale_:              0.5,
        seed_:               0.0,
        normalScale:        .08,
        redistribution_:      4.,
        persistance_:        .35,
        lacunarity_:          3.,
        iteration_:           15,
        terbulance_:        true,
        ridge_:            false,
    },
    (previous,current)=>{
        current = NODE.float(1).sub(current)
        let t1  = NODE.mix(current,previous,previous)
        return t1  
    })
    cubeMap.toNormal({
        scale:    2.25,  
        epsilon: 0.0008,  
        strength:   1.,    
    })
    cubeMap.snapShotLeft(cubeMapDownload)
    cubeMap.dispose()
    let cN = cubeMap.textuerArray.map((canvas)=>{return new THREE.CanvasTexture(canvas)})
    return cN
}

export function cubeMapTop(renderer_){
    let cubeMapDownload  = false
    const cubeMap = new CubeMap(true)
    cubeMap.build(6000,renderer_.renderer)
    cubeMap.simplexFbm({
        inScale:          8.5,
        scale_:           5.5,
        seed_:            6.0,
        normalScale:      .08,
        redistribution_:   5.,
        persistance_:     .35,
        lacunarity_:       2.,
        iteration_:        10,
        terbulance_:    false,
        ridge_:         false,
    })

    cubeMap.simplexFbm({
        inScale:             1.5,
        scale_:              0.5,
        seed_:               0.0,
        normalScale:        .08,
        redistribution_:      4.,
        persistance_:        .35,
        lacunarity_:          3.,
        iteration_:           15,
        terbulance_:        true,
        ridge_:            false,
    },
    (previous,current)=>{
        current = NODE.float(1).sub(current)
        let t1  = NODE.mix(current,previous,previous)
        return t1  
    })
    /*cubeMap.toNormal({
        scale:    2.25,  
        epsilon: 0.0008,  
        strength:   1.,    
    })*/
    cubeMap.toDisplace()
    cubeMap.snapShotTop(cubeMapDownload)
    cubeMap.dispose()
    let cN = cubeMap.textuerArray.map((canvas)=>{return new THREE.CanvasTexture(canvas)})
}

export function cubeMapBottom(renderer_){
    let cubeMapDownload  = false
    const cubeMap = new CubeMap(true)
    cubeMap.build(3000,renderer_.renderer)
    cubeMap.simplexFbm({
        inScale:          8.5,
        scale_:           5.5,
        seed_:            6.0,
        normalScale:      .08,
        redistribution_:   5.,
        persistance_:     .35,
        lacunarity_:       2.,
        iteration_:        10,
        terbulance_:    false,
        ridge_:         false,
    })

    cubeMap.simplexFbm({
        inScale:             1.5,
        scale_:              0.5,
        seed_:               0.0,
        normalScale:        .08,
        redistribution_:      4.,
        persistance_:        .35,
        lacunarity_:          3.,
        iteration_:           15,
        terbulance_:        true,
        ridge_:            false,
    },
    (previous,current)=>{
        current = NODE.float(1).sub(current)
        let t1  = NODE.mix(current,previous,previous)
        return t1  
    })
    cubeMap.toNormal({
        scale:    2.25,  
        epsilon: 0.0008,  
        strength:   1.,    
    })
    cubeMap.snapShotBottom(cubeMapDownload)
    cubeMap.dispose()
    let cN = cubeMap.textuerArray.map((canvas)=>{return new THREE.CanvasTexture(canvas)})
    return cN
}

export function cubeMapFront(renderer_){
    let cubeMapDownload  = false
    const cubeMap = new CubeMap(true)
    cubeMap.build(6000,renderer_.renderer)
    cubeMap.simplexFbm({
        inScale:          8.5,
        scale_:           5.5,
        seed_:            6.0,
        normalScale:      .08,
        redistribution_:   5.,
        persistance_:     .35,
        lacunarity_:       2.,
        iteration_:        10,
        terbulance_:    false,
        ridge_:         false,
    })

    cubeMap.simplexFbm({
        inScale:             1.5,
        scale_:              0.5,
        seed_:               0.0,
        normalScale:        .08,
        redistribution_:      4.,
        persistance_:        .35,
        lacunarity_:          3.,
        iteration_:           15,
        terbulance_:        true,
        ridge_:            false,
    },
    (previous,current)=>{
        current = NODE.float(1).sub(current)
        let t1  = NODE.mix(current,previous,previous)
        return t1  
    })
    /*cubeMap.toNormal({
        scale:    2.25,  
        epsilon: 0.0008,  
        strength:   1.,    
    })*/
    //cubeMap.toDisplace()
    cubeMap.snapShotFront(cubeMapDownload)
    cubeMap.dispose()
    let cN = cubeMap.textuerArray.map((canvas)=>{return new THREE.CanvasTexture(canvas)})
    return cN
}

export function cubMapBack(renderer_){
    let cubeMapDownload  = false
    const cubeMap = new CubeMap(true)
    cubeMap.build(3000,renderer_.renderer)
    cubeMap.simplexFbm({
        inScale:          8.5,
        scale_:           5.5,
        seed_:            6.0,
        normalScale:      .08,
        redistribution_:   5.,
        persistance_:     .35,
        lacunarity_:       2.,
        iteration_:        10,
        terbulance_:    false,
        ridge_:         false,
    })

    cubeMap.simplexFbm({
        inScale:             1.5,
        scale_:              0.5,
        seed_:               0.0,
        normalScale:        .08,
        redistribution_:      4.,
        persistance_:        .35,
        lacunarity_:          3.,
        iteration_:           15,
        terbulance_:        true,
        ridge_:            false,
    },
    (previous,current)=>{
        current = NODE.float(1).sub(current)
        let t1  = NODE.mix(current,previous,previous)
        return t1  
    })
    cubeMap.toNormal({
        scale:    2.25,  
        epsilon: 0.0008,  
        strength:   1.,    
    })
    cubeMap.snapShotBack(cubeMapDownload)
    cubeMap.dispose()
    let cN = cubeMap.textuerArray.map((canvas)=>{return new THREE.CanvasTexture(canvas)})
    return cN
}