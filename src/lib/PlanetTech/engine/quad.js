import * as NODE    from 'three/nodes';
import * as THREE   from 'three';
import {QuadTrees}  from './quadtree'
import {norm}       from './utils'
import * as Shaders from '../shaders/index.js';


  export default class Quad{
    constructor(w,h,ws,hs,d){
      this.quadData  = {
        width:          w,
        height:         h,
        widthSegments:  ws,
        heightSegments: hs,
        dimensions:     d,
       }
       this.children  = []
       this.instances = []
       this.textures  = [] 
       this.quadTreeconfig = new QuadTrees.QuadTreeLoDCore()
       this.count     = 1 
      }
  
    update(player){
      this.quadTree.update(player,this)
    }

    add( q ){
        this.children.push( q )
        this.plane.add(q.plane)
    }

    lighting(ld){
      this.quadTreeconfig.config.light = {ld:ld}
      for (var i = 0; i < this.instances.length; i++) {
        var p = this.instances[i].plane
        p.material.colorNode = Shaders.defualtLight({
          normalMap:p.material.colorNode.rgba,
          lightPosition:ld,
          cP:NODE.vec3(0.,0.,0.)
        })
      }
    }


    addTexture(texture_, displacementScale){
      this.textures.push(texture_)
      this.quadTreeconfig.config.dataTransfer[this.side] = {textuers:this.textures}
      var w = this.quadData.width
      var d = this.quadData.dimensions
      var testscaling = w / ( w * d )
      var halfScale   = testscaling / 2
      for (var i = 0; i < this.instances.length; i++) {
        var q = this.instances[i]
        var p = q.plane
        var wp = p.position.clone()//todo
        var nxj = norm(wp.x,Math.abs(( w * d )/2),-Math.abs(( w * d )/2))
        var nyj = norm(wp.y,Math.abs(( w * d )/2),-Math.abs(( w * d )/2))
        var offSets = NODE.vec2(nxj-halfScale,nyj-halfScale)
        var newUV   = NODE.uv().mul(testscaling).add(offSets)
        var cnt = this.quadTreeconfig.config.cnt.clone()
        p.worldToLocal(cnt)
        var textureNodeN = NODE.texture(texture_[0],newUV).mul(2).sub(1)
        var textureNodeD = NODE.texture(texture_[1],newUV).r
        if(p.material.positionNode){
          p.material.colorNode = textureNodeN
          const displace = textureNodeD.mul(displacementScale).mul(NODE.positionLocal.sub(cnt).normalize())
          p.material.positionNode =  p.material.positionNode.add( displace );
        }else{
          //var mouse = p.material.uniforms[`displacementScale_${this.count}`]
          //var ld    = p.material.uniforms[`lightDirection_${this.count}`]
          //const screenFXNode = NODE.uniform( mouse )
          //var ld  = NODE.uniform( ld ).add(NODE.vec3(.0, .0, 0))
          //const displace = textureNode.x.mul(screenFXNode.x).mul(NODE.normalLocal)
          //p.material.colorNode = textureNode .mul(2.0).sub(1.0)//lighting((displacedNormal(textureNode,newUV)),ld )
          //p.material.positionNode = NODE.positionLocal.add(displace);
          //const displace = textureNode.z.mul(displacementScale).mul(NODE.normalLocal)
          //p.material.colorNode = textureNode
          //p.material.positionNode = NODE.positionLocal.add( displace );
        }
        }
        this.count++
      }


    createNewMesh(shardedGeometry){
      const width  = shardedGeometry.parameters.width
      const height = shardedGeometry.parameters.height
      const heightSegments = shardedGeometry.parameters.heightSegments
      const widthSegments  = shardedGeometry.parameters.widthSegments
      const material = this.quadTreeconfig.config.material.clone();
      const quad     = new Quad(width,height,widthSegments,heightSegments)
      quad.plane     = new THREE.Mesh( shardedGeometry, material );
      quad.plane.frustumCulled = false
      return quad
      }

    createQuadTree(lvl){
      Object.assign(this.quadTreeconfig.config,{
        maxLevelSize:  this.quadData.width,
        minLevelSize:  Math.floor(this.quadData.width/Math.pow(2,lvl-1)),
        minPolyCount:  this.quadData.widthSegments,
        dimensions:    this.quadData.dimensions,
        }
      )
      this.quadTreeconfig.levels(lvl)
      this.quadTreeconfig.createArrayBuffers()
      this.quadTree = new QuadTrees.QuadTreeLoD()
    }  

    createDimensions(sideName){
      this.side = sideName
      const w = this.quadData.width
      const d = this.quadData.dimensions
      const shardedGeometry = this.quadTreeconfig.config.arrybuffers[w]
      for (var i = 0; i < d; i++) {
        var i_ = ((i*(w-1))+i)+((-(w/2))*(d-1))
        for (var j = 0; j < d; j++) {
          var j_ = ((j*(w-1))+j)+((-(w/2))*(d-1))
          var q = this.createNewMesh(shardedGeometry).setPosition( [i_,-j_,0], 'dimensions')
          q.quadTree = new QuadTrees.QuadTreeLoD()
          q.side = sideName
          this.instances.push(q)
        }
      }
    }

    createTiles(sideName){
      this.side = sideName
      const w = this.quadData.width
      const d = this.quadData.dimensions
      for (var i = 0; i < d; i++) {
        var i_ = ((i*(w-1))+i)+((-(w/2))*(d-1))
        for (var j = 0; j < d; j++) {
          var j_ = ((j*(w-1))+j)+((-(w/2))*(d-1))
          var q = new THREE.Object3D()
          q.position.set(...[i_,-j_,0]) 
          q.side = sideName
          this.instances.push(q)
        }
      }
    }
  

    setPosition( params, quadrent){
      this.plane.updateMatrixWorld(true)
      if       (quadrent=='NW')  {
        this.plane.position.set(-params[0]/2,  params[1]/2, 0)
      }else if (quadrent=='NE') {
        this.plane.position.set( params[0]/2,  params[1]/2, 0)
      }else if (quadrent=='SE') {
        this.plane.position.set( params[0]/2, -params[1]/2, 0)
      }else if (quadrent=='SW') {
        this.plane.position.set(-params[0]/2, -params[1]/2, 0)
      }else if (quadrent=='dimensions') {
        this.plane.position.set(...params)
      }
      return this
    }

    active(a){
      if (a == true){
        this._active = a
        this.plane.material.visible = a;
          if(this.children.length != 0){
            this.children[0].plane.material.visible = !a
            this.children[1].plane.material.visible = !a
            this.children[2].plane.material.visible = !a
            this.children[3].plane.material.visible = !a
          }
        }else if (a == false) {
          this._active = a
          this.plane.material.visible = a;
        }
      }
  
  }
  