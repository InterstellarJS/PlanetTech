import {expect,describe,it,vi } from "vitest"
import Quad from "../src/lib/PlanetTech/engine/quad"; 
import * as THREE from 'three';
import * as NODE  from 'three/nodes';
import {positionData} from './utils'

const quad = new Quad(100,100,10,10,2)

  describe('Quad test 1', () => {
    it("testing the instnace varibales",()=>{
      const quad = new Quad(10,10,2,2,1)
      expect(quad.quadData).toEqual({
        width:          10,
        height:         10,
        widthSegments:  2,
        heightSegments: 2,
        dimensions:     1,})
    })
  });
  
  describe('Quad test 2', () => {
    it("createQuadTree lvls",()=>{
      const quadSpy = vi.spyOn(quad, 'createQuadTree')
      quad.createQuadTree(5)
      expect(quadSpy).toHaveBeenCalledWith(5)
    })
  });
  
  describe('Quad test 3', () => {
    it("createDimensions: build the matrix of planes ",()=>{
      const quadSpy = vi.spyOn(quad, 'createDimensions')
      quad.createDimensions('front')
      expect(quadSpy).toHaveBeenCalledWith('front')
    })
  });

  describe('Quad test 4', () => {
    it("instances array length",()=>{
        expect(quad.instances.length).toEqual(4)
    })
  });

  describe('Quad test 5', () => {
    it("test each plane obj position",()=>{
        let posData = positionData()
        quad.instances.forEach((e,i)=>{
        expect(e.plane.position.toArray()).toEqual(posData[i])
       })
    })
  });

  describe('Quad test 6', () => {
    it("test createNewMesh",()=>{
      let mesh = quad.createNewMesh(new THREE.PlaneGeometry(100,100,10,10))
      expect(mesh).toBeInstanceOf(Quad)
      expect(mesh.plane).toBeInstanceOf(THREE.Mesh)
      expect(mesh.plane.material).toBeInstanceOf(NODE.MeshBasicNodeMaterial)
      expect(mesh.plane.geometry).toBeInstanceOf(THREE.PlaneGeometry)
    })
  });

  describe('Quad test 7', () => {
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
    
    it("quadTreeconfig.config.material: toEqual",()=>{
      let config = quad.quadTreeconfig.config
      let material = config.material
      expect(material).toBeInstanceOf(NODE.MeshBasicNodeMaterial)
    })

    describe('Quad test 8', () => {
      it("createQuadTree.addTexture: toHaveBeenCalledWith",()=>{
        quad.instances.forEach((x)=>{
          x.plane.material.positionNode = NODE.positionLocal
        });
        const quadSpy = vi.spyOn(quad, 'addTexture')
        let t1 = new THREE.TextureLoader().load('')
        let t2 = new THREE.TextureLoader().load('')
        quad.quadTreeconfig.config.cnt = new THREE.Vector3(0,0,-50)
        quad.addTexture([t1,t2],0)
        expect(quadSpy).toHaveBeenCalledWith([t1,t2],0)
      })
    });


    describe('Quad test 9', () => {
      it("quad dataTransfer",()=>{
        let config = quad.quadTreeconfig.config
        let dataTransfer = config.dataTransfer
        expect(dataTransfer.front.textuers.length).toEqual(1)
        expect(dataTransfer.front.textuers[0].length).toEqual(2)
        //expect(dataTransfer.front.textuers[0][0]).toBeInstanceOf(THREE.TextureLoader)
        //expect(dataTransfer.front.textuers[0][1]).toBeInstanceOf(THREE.TextureLoader)
        expect(dataTransfer.front.textuers[0][0].isTexture).toEqual(true)
        expect(dataTransfer.front.textuers[0][1].isTexture).toEqual(true)
      })
    });

    /*
    it("quadTreeconfig.config.color: toEqual",()=>{
      let config = quad.quadTreeconfig.config
      let color  = config.color
    })

    it("quadTreeconfig.config.light: toEqual",()=>{
      let config = quad.quadTreeconfig.config
      let light  = config.light
    })*/
  });
   
  