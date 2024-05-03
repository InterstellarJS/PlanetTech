import {Quad}  from '../../src/engine/quad.js'
import { QuadTrees } from '../../src/engine/quadtree.js'
import * as NODE    from 'three/nodes';
import * as THREE   from 'three';
import { expect, test, describe,it, beforeEach } from 'vitest'


describe('Quad class', () => {
    let quad, quadTreeconfig

    beforeEach(()=>{
      quad = new Quad(10000,10000,50,50,2)
      quadTreeconfig = new QuadTrees.QuadTreeLoDCore()
    })

    it('Init Quad Class',()=>{
      let quadData  = {
        width:          10000,
        height:         10000,
        widthSegments:  50,
        heightSegments: 50,
        dimensions:     2,
        }
      expect(quad.quadData).toStrictEqual(quadData)
    })

    it('Init Quad Class Children Array Empty',()=>{
      expect(quad.children).toHaveLength(0);
    })

    it('Init Quad Class Instance Array Empty',()=>{
      expect(quad.instances).toHaveLength(0);
    })

    it('Init Quad Class QuadTreeconfig Is Of Type QuadTreeLoDCore',()=>{
      expect(quad.quadTreeconfig).toBeInstanceOf(QuadTrees.QuadTreeLoDCore)
    })

    it('quad.quadTreeconfig.config.arrybuffers',()=>{
      let wh = 10000
      let poly = 50
      let arryBuffers = { 
      [wh/1]:new THREE.PlaneGeometry(wh,wh,poly,poly),
      [wh/2]:new THREE.PlaneGeometry(wh/2,wh/2,poly*2,poly*2),
      [wh/4]:new THREE.PlaneGeometry(wh/4,wh/4,poly*4,poly*4),
      [wh/8]:new THREE.PlaneGeometry(wh/8,wh/8,poly*8,poly*8),
      }
      quad.createQuadTree(4)
      let quadArryBuffers = quad.quadTreeconfig.config.arrybuffers //TODO fix spelling arrybuffers to arrayBuffers

      for (const [key, value] of Object.entries(arryBuffers)) {
        expect(quadArryBuffers).toHaveProperty(key)
        expect(quadArryBuffers[key].idx).toEqual(Array.from(arryBuffers[key].index.array))
        expect(quadArryBuffers[key].geometry.stringNormal).toEqual(arryBuffers[key].attributes.normal.array.toString()) 
        expect(quadArryBuffers[key].geometry.stringPosition).toEqual(arryBuffers[key].attributes.position.array.toString()) 
        expect(quadArryBuffers[key].geometry.stringUv).toEqual(arryBuffers[key].attributes.uv.array.toString()) 
        expect(quadArryBuffers[key].geometry.parameters).toStrictEqual(arryBuffers[key].parameters) 
        expect(quadArryBuffers[key].geometry.byteLengthNormal).toEqual(arryBuffers[key].attributes.normal.array.byteLength) 
        expect(quadArryBuffers[key].geometry.byteLengthPosition).toEqual(arryBuffers[key].attributes.normal.array.byteLength) 
      }
    })

    it('quad.quadTreeconfig.config.center',()=>{
      quad.createQuadTree(4)
      quad.quadTreeconfig.getCenter()
      let quadcenter = quad.quadTreeconfig.config.center 
      expect(quadcenter).toStrictEqual([0,0,-10000])
    })
  })