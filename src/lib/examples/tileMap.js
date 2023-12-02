import * as NODE          from 'three/nodes';
import * as THREE         from 'three';
import { CubeMap }        from '../cubeMap/cubeMap';
import { TileMap }        from '../cubeMap/tileMap';
import { Moon }           from '../PlanetTech/celestialBodies/moon';
import { hexToRgbA }      from '../PlanetTech/engine/utils';
import { getRandomColor } from '../PlanetTech/engine/utils';

export function tileMap         (renderer_){
    let cubeMapDownload  = false
    let tileMapFull      = false
    let tileMapFullTiles = false

    const cubeMap = new CubeMap()
    cubeMap.build(3000,renderer_.renderer)
    cubeMap.simplexFbm({
        inScale:          7.0,
        scale_:           5.5,
        outScale:         0.3,
        seed_:            1.0,
        normalScale:      .08,
        redistribution_:   6.,
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
        redistribution_:   4.,
        persistance_:     .35,
        lacunarity_:       2.2,
        iteration_:        10,
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
        scale:    3.5,  
        epsilon: 0.0015,  
        strength:   1.,    
    })
    cubeMap.dispose()
    let cN = cubeMap.textuerArray.map((canvas)=>{return new THREE.CanvasTexture(canvas)})
    let tileMapN = new TileMap(2,4,true)
    tileMapN.build(2000,cubeMap.rtt.renderer_)
    tileMapN.addTextures(cN) 
    tileMapN.snapShot(tileMapFull,tileMapFullTiles)
    //let N = tileMapN.textuerArray.map((canvas)=>{return new THREE.CanvasTexture(canvas)})
    //return N
    //return  cubeMap.textuerArray.map((canvas)=>{return new THREE.CanvasTexture(canvas)})[0]
}

export function tileMapCubeMapRight    (renderer_){
    let cubeMapDownload  = false
    let tileMapFull      = false
    let tileMapFullTiles = false

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

    let tileMapN = new TileMap(2,3,true)
    tileMapN.build(3000,cubeMap.rtt.renderer_)
    tileMapN.addTexture(0,cN[0]) 
    tileMapN.snapShotRight(tileMapFull,tileMapFullTiles)
}

export function tileMapCubeMapLeft     (renderer_){
    let cubeMapDownload  = false
    let tileMapFull      = false
    let tileMapFullTiles = false

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

    let tileMapN = new TileMap(2,3,true)
    tileMapN.build(3000,cubeMap.rtt.renderer_)
    tileMapN.addTexture(1,cN[0]) 
    tileMapN.snapShotLeft(tileMapFull,tileMapFullTiles)
}

export function tileMapCubeMapTop      (renderer_){
    let cubeMapDownload  = false
    let tileMapFull      = false
    let tileMapFullTiles = false

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
    cubeMap.snapShotTop(cubeMapDownload)

    cubeMap.dispose()
    let cN = cubeMap.textuerArray.map((canvas)=>{return new THREE.CanvasTexture(canvas)})

    let tileMapN = new TileMap(2,3,true)
    tileMapN.build(3000,cubeMap.rtt.renderer_)
    tileMapN.addTexture(3,cN[0]) 
    tileMapN.snapShotTop(tileMapFull,tileMapFullTiles)
}

export function tileMapCubeMapBottom   (renderer_){
    let cubeMapDownload  = false
    let tileMapFull      = false
    let tileMapFullTiles = false

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

    let tileMapN = new TileMap(2,3,true)
    tileMapN.build(3000,cubeMap.rtt.renderer_)
    tileMapN.addTexture(4,cN[0]) 
    tileMapN.snapShotBottom(tileMapFull,tileMapFullTiles)
}

export function tileMapCubeMapFront    (renderer_){
    let cubeMapDownload  = false
    let tileMapFull      = false
    let tileMapTiles     = false

    const cubeMap = new CubeMap()
    cubeMap.build(3000,renderer_)
    cubeMap.simplexFbm({
        inScale:          7.0,
        scale_:           5.5,
        outScale:         0.3,
        seed_:            1.0,
        normalScale:      .08,
        redistribution_:   6.,
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
        redistribution_:   4.,
        persistance_:     .35,
        lacunarity_:       2.2,
        iteration_:        10,
        terbulance_:    false,
        ridge_:         false,
    })
    cubeMap.toNormal({
        scale:    3.5,  
        epsilon: 0.0015,  
        strength:   1.,    
    })
    cubeMap.snapShotBack(cubeMapDownload)

    cubeMap.dispose()
    let cN = cubeMap.textuerArray.map((canvas)=>{return new THREE.CanvasTexture(canvas)})
    
    let tileMapN = new TileMap(2,4,true)
    tileMapN.build(1024,cubeMap.rtt.renderer_)
    tileMapN.addTexture(5,cN[0]) 
    tileMapN.snapShotBack(tileMapFull,tileMapTiles)
}

export function tileMapCubeMapBack     (renderer_){
    let cubeMapDownload  = false
    let tileMapFull      = false
    let tileMapFullTiles = false

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

    let tileMapN = new TileMap(2,3,true)
    tileMapN.build(3000,cubeMap.rtt.renderer_)
    tileMapN.addTexture(5,cN[0]) 
    tileMapN.snapShotBack(tileMapFull,tileMapFullTiles)
    let N = tileMapN.textuerArray.map((canvas)=>{return new THREE.CanvasTexture(canvas)})
}

 function _tileTextuerFront(renderer_,N,M,Nt,Mt){
    let tileMapFull      = false
    let tileMapFullTiles = false
    let tileMapN = new TileMap(2,4,true)
    tileMapN.build(2512,renderer_.renderer)

    tileMapN.addTexture(4,N)
    tileMapN.addMask(4,M)

    tileMapN.addTexture(2,Nt)
    tileMapN.addMask(2,Mt)

    tileMapN.snapShotFront(tileMapFull,tileMapFullTiles)
    tileMapN.snapShotTop(tileMapFull,tileMapFullTiles)

    return tileMapN.textuerArray.map((canvas)=>{return new THREE.CanvasTexture(canvas)})
}
export const tileTextuerFront = _tileTextuerFront

async function _tileTextuerTop(renderer_){
    let tileMapFull      = false
    let tileMapFullTiles = false
    //let N = await new THREE.TextureLoader().loadAsync('./planet/t_image.png')
    let tileMapN = new TileMap(2,4,true)
    tileMapN.build(2512,renderer_.renderer)
    tileMapN.snapShotTop(tileMapFull,tileMapFullTiles)
}
export const tileTextuerTop = _tileTextuerTop


async function _tileTextuerWorld(renderer_,NF,ND){

   let moon = new Moon({
      size:            10000,
      polyCount:          300,
      quadTreeDimensions:  4,
      levels:              1,
      radius:          80000,
      displacmentScale: 80.5,
      lodDistanceOffset: 7.4,
      material: new NODE.MeshBasicNodeMaterial(),
    })
    moon.front.addTextureTiles({
      0:[NF,ND],
    },80.5)    
    moon.front.lighting(NODE.vec3(0.0,4.5,4.5))
    console.log(moon.sphere.children)
    renderer_.scene_.add( moon.sphere.children[0]);
    return moon 
}
export const tileTextuerWorld = _tileTextuerWorld

 function _tileTextuerLoad(renderer_,array,maskArray){
    let tileMapFull      = false
    let tileMapFullTiles = false
    let tileMapN = new TileMap(2,4,false)
    tileMapN.build(3000,renderer_.renderer)
    tileMapN.addTextures(array)
    tileMapN.addMask({
        scale:12,
        offsetX:0,
        offsetY:0
        },
        maskArray)
    tileMapN.snapShotFront(tileMapFull,tileMapFullTiles)
    return tileMapN.textuerArray.map((canvas)=>{return new THREE.CanvasTexture(canvas)})[0]


}
export const tileTextuerLoad = _tileTextuerLoad