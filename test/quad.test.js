import {expect,describe,it,vi } from "vitest"
import Quad from "../src/lib/PlanetTech/engine/quad"; 
import * as THREE  from 'three';

const quad = new Quad(100,100,10,10,2)

  describe('Quad test 1', () => {
    it("testing the instnace varibales",()=>{
      const quad = new Quad(10,10,5,5,1)
      expect(quad.quadData).toEqual({
        width:          10,
        height:         10,
        widthSegments:  5,
        heightSegments: 5,
        dimensions:     1,})
    })
  });
  
  describe('Quad test 2', () => {
    it("createQuadTree: toHaveBeenCalledWith",()=>{
      const quadSpy = vi.spyOn(quad, 'createQuadTree')
      quad.createQuadTree(5)
      expect(quadSpy).toHaveBeenCalledWith(5)
    })
  });
  
  describe('Quad test 3', () => {
    it("createDimensions: toHaveBeenCalledWith",()=>{
      const quadSpy = vi.spyOn(quad, 'createDimensions')
      quad.createDimensions('front')
      expect(quadSpy).toHaveBeenCalledWith('front')
    })
  });




  describe('Quad test 4', () => {
    it("quadTreeconfig.config.arrybuffers: toEqual",()=>{
      let config = quad.quadTreeconfig.config
      let arrybuffersKeys = Object.keys(config.arrybuffers).map(i=>Number(i))
      expect(arrybuffersKeys).toEqual([6,12,25,50,100])
      Object.values(config.arrybuffers).map((e,i)=>{
        expect(e.parameters.width) .toEqual(arrybuffersKeys[i])
        expect(e.parameters.height).toEqual(arrybuffersKeys[i])
      })
    })
    
    it("[maxLevelSize,minLevelSize,minPolyCount,maxPolyCount]: toEqual",()=>{
      let config = quad.quadTreeconfig.config
      let maxLevelSize = config.maxLevelSize
      let minLevelSize = config.minLevelSize
      let minPolyCount = config.minPolyCount
      let maxPolyCount = config.maxPolyCount
        expect(maxLevelSize).toEqual(100)
        expect(minLevelSize).toEqual(6)
        expect(minPolyCount).toEqual(10)
        expect(maxPolyCount).toEqual(160)
    })

    it("quadTreeconfig.config.scale: toEqual",()=>{
      let config = quad.quadTreeconfig.config
      let scale  = config.scale
      expect(scale).toEqual(1)
    })


    it("quadTreeconfig.config.position: toEqual",()=>{
      let config   = quad.quadTreeconfig.config
      let position = config.position
      expect(position).toEqual({x:0,y:0,z:0})
    })


    it("quadTreeconfig.config.dimensions: toEqual",()=>{
      let config   = quad.quadTreeconfig.config
      let dimensions = config.dimensions
      expect(dimensions).toEqual(2)
    })
    
    
    it("quadTreeconfig.config.displacmentScale: toEqual",()=>{
      let config   = quad.quadTreeconfig.config
      let displacmentScale = config.displacmentScale
      expect(displacmentScale).toEqual(1)
    })
    
    it("quadTreeconfig.config.lodDistanceOffset: toEqual",()=>{
      let config   = quad.quadTreeconfig.config
      let lodDistanceOffset = config.lodDistanceOffset
      expect(lodDistanceOffset).toEqual(1)
    })    

    it("quadTreeconfig.config.levels: toEqual",()=>{
      let config       = quad.quadTreeconfig.config
      let levelsArray  = config.levels.levelsArray
      let numOflvls    = config.levels.numOflvls
      let polyPerLevel = config.levels.polyPerLevel
      expect(levelsArray).toEqual([100, 50, 25, 12, 6])
      expect(numOflvls).toEqual(5)
      expect(polyPerLevel).toEqual([10, 20, 40, 80, 160])
    })

    it("quadTreeconfig.config.dataTransfer: toEqual",()=>{
      let config = quad.quadTreeconfig.config
      let dataTransferKeys = Object.keys(config.dataTransfer)
      expect(dataTransferKeys).toEqual(['front', 'back', 'right','left','top','bottom'])
      expect(config.dataTransfer).toEqual({
        "front": {
            "textuers": []
        },
        "back": {
            "textuers": []
        },
        "right": {
            "textuers": []
        },
        "left": {
            "textuers": []
        },
        "top": {
            "textuers": []
        },
        "bottom": {
            "textuers": []
        }
      })
    })
    
    describe('Quad test 5', () => {
      it("createQuadTree: toHaveBeenCalledWith",()=>{
        const quadSpy = vi.spyOn(quad, 'addTexture')
        let t1 = new THREE.TextureLoader().load('./planet/p2/right_normal_image.png')
        let t2 = new THREE.TextureLoader().load('./planet/p2/left_normal_image.png')
        quad.quadTreeconfig.config.cnt = new THREE.Vector3(0,0,-50)
        quad.addTexture([t1,t2],0)
        expect(quadSpy).toHaveBeenCalledWith([t1,t2],0)
      })
    });

    /*it("quadTreeconfig.config.color: toEqual",()=>{
      let config = quad.quadTreeconfig.config
      let color  = config.color
      
    })

    it("quadTreeconfig.config.light: toEqual",()=>{
      let config = quad.quadTreeconfig.config
      let light  = config.light
      
    })

    it("quadTreeconfig.config.material: toEqual",()=>{
      let config = quad.quadTreeconfig.config
      let material  = config.material
      
    })*/

  });
   
  