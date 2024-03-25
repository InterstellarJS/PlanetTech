import * as NODE    from 'three/nodes';
import * as THREE   from 'three';
import {QuadTrees}  from './quadtree.js'
import {norm}       from './utils.js'
import { QuadWorker } from './utils.js';


  export class Quad{
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
    this.quadTreeconfig = new QuadTrees.QuadTreeLoDCore()
    }
  
    update(player){
      this.quadTree.update(player,this)
    }

    add( q ){
        this.children.push( q )
        this.plane.add(q.plane)
        let parentPositionVector = [...this.plane.localToWorld(new THREE.Vector3()).toArray(),this.quadData.width]
        q.initGeometry({positionVector:q.plane.position.toArray(),parentPositionVector:parentPositionVector,side:this.side})        
        q.active(false)
    }

    addTexture(texture_, displacementScale, tiles){
      texture_[0].colorSpace = THREE.SRGBColorSpace
      this.quadTreeconfig.config.isTiles = tiles
      this.quadTreeconfig.config.dataTransfer[this.side] = {textuers:[texture_]}
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
        var cnt = new THREE.Vector3(...this.quadTreeconfig.config.center)
        p.worldToLocal(cnt)
        var textureNodeN = NODE.texture(texture_[0],newUV)
        var textureNodeD = NODE.texture(texture_[1],newUV).r
        p.material.colorNode = textureNodeN
       const displace = textureNodeD.mul(displacementScale).mul(NODE.normalLocal).add(NODE.positionLocal)
       p.material.positionNode = displace
        }
      } 

    createNewMesh(shardedGeometry){
      const width  = shardedGeometry.parameters.width
      const height = shardedGeometry.parameters.height
      const heightSegments = shardedGeometry.parameters.heightSegments
      const widthSegments  = shardedGeometry.parameters.widthSegments
      //--
      const quad = new Quad(width,height,widthSegments,heightSegments)
      quad.quadTreeconfig.config = this.quadTreeconfig.config
      //--
      let bufferGeometry  = new THREE.BufferGeometry()
      bufferGeometry.setIndex([]);
      bufferGeometry.setAttribute('position', new THREE.Float32BufferAttribute( [], 3 ));
      bufferGeometry.setAttribute('normal', new THREE.Float32BufferAttribute( [], 3 ));
      bufferGeometry.setAttribute('uv', new THREE.Float32BufferAttribute( [], 2 ));
      //--
      let material = this.quadTreeconfig.config.material.clone();
      quad.plane     = new THREE.Mesh(bufferGeometry,material);
      return quad
      }


    createQuadTree(lvl){
      Object.assign(this.quadTreeconfig.config,{
        maxLevelSize:  this.quadData.width,
        minLevelSize:  Math.floor(this.quadData.width/Math.pow(2,lvl-1)), // this create a vizual bug when not divisible pay 2 
        minPolyCount:  this.quadData.widthSegments,
        dimensions:    this.quadData.dimensions,
        }
      )
      this.quadTreeconfig.levels(lvl)
      this.quadTreeconfig.createArrayBuffers()
      this.quadTree = new QuadTrees.QuadTreeLoD()
    }  


      initGeometry(params){
        const w = this.quadData.width
        const arrybuffers = this.quadTreeconfig.config.arrybuffers[w]
      
        const stringUv             = arrybuffers.geometry.stringUv
        const stringPosition       = arrybuffers.geometry.stringPosition
        const stringNormal         = arrybuffers.geometry.stringNormal

        const byteLengthPosition   = arrybuffers.geometry.byteLengthPosition
        const byteLengthNormal     = arrybuffers.geometry.byteLengthNormal

        const position             = params.positionVector

        const bufferPositionF      = new SharedArrayBuffer(byteLengthPosition); 
        const bufferNormalF        = new SharedArrayBuffer(byteLengthNormal);

        //DEPENDING IF ENVIERMENT IS REACT I NEED TO CALL window.SharedArrayBuffer
        //const bufferPositionF      = new window.SharedArrayBuffer(byteLengthPosition); //byte length
        //const bufferNormalF        = new window.SharedArrayBuffer(byteLengthNormal); //byte length

        const typedArrPF           = new Float32Array(bufferPositionF);
        const typedArrNF           = new Float32Array(bufferNormalF);

        const center               = this.quadTreeconfig.config.center
        const radius               = this.quadTreeconfig.config.radius
        const parentPositionVector = params.parentPositionVector
        const bufferIdx            = arrybuffers.idx
        
       let promiseWorker =  new QuadWorker(new Worker(new URL('./worker.js', import.meta.url).toString(),{ type: "module" }));
      promiseWorker.sendWork({
        parentPositionVector: parentPositionVector,
        positionBuffer: bufferPositionF,
        normalBuffer:   bufferNormalF,
        positionVector: position,
        positionStr:    stringPosition,
        normalStr:      stringNormal,
        center:         center,
        radius:         radius,
        side:           params.side
      });
      
      promiseWorker.getWork(this,typedArrPF,typedArrNF,bufferIdx,stringUv)
      }

    createDimensions(sideName){
      this.side = sideName
      const w = this.quadData.width
      const d = this.quadData.dimensions
      const arrybuffers = this.quadTreeconfig.config.arrybuffers[w]
      const shardedGeometry = arrybuffers.geometry
      for (var i = 0; i < d; i++) {
        var i_ = ((i*(w-1))+i)+((-(w/2))*(d-1))
        for (var j = 0; j < d; j++) {
          var j_ = ((j*(w-1))+j)+((-(w/2))*(d-1))
          var q = this.createNewMesh(shardedGeometry).setPosition( [i_,-j_,0], 'dimensions')
          q.initGeometry({positionVector:q.plane.position.toArray(),parentPositionVector:[0,0,0,w],side:'front'})        
          q.quadTree = new QuadTrees.QuadTreeLoD()
          q.side = sideName
          q.idx = i * d + j;
          this.instances.push(q)
        }
      }
    }

    setPosition( params, quadrent){
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
          if(this.children.length != 0){
            this.plane.material.visible = a;
            this.children[0].plane.material.visible = !a
            this.children[1].plane.material.visible = !a
            this.children[2].plane.material.visible = !a
            this.children[3].plane.material.visible = !a
          }
        }else if (a == false) {
          this._active = a
          this.plane.material.visible = a;
          if(this.children.length != 0){
            this.children[0].plane.material.visible = !a
            this.children[1].plane.material.visible = !a
            this.children[2].plane.material.visible = !a
            this.children[3].plane.material.visible = !a
          }
        }
      }
  
  }
  