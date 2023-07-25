import * as NODE from 'three/nodes';
import * as THREE   from 'three';
import {QuadTrees}  from './quadtree'
import {norm}       from './utils'
import {
  snoise3D,fbmNoise,displacementNormalNoise,light,patternNoise,displacementNormalNoiseFBM,displacementDomainWarping
} from  './../shaders/glslFunctions'



var snoiseCount = 0 
var fbmCount = 0
var displacementNormalCount= 0 
var patternCount = 0 


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


    addTexture(texture_){
      this.textures.push(texture_)
      Object.assign(this.quadTreeconfig.config,{dataTransfer: {textures:this.textures}})
      var w = this.quadData.width
      var d = this.quadData.dimensions
      var testscaling = w / ( w * d )
      var halfScale   = testscaling / 2
      for (var i = 0; i < this.instances.length; i++) {
        var p = this.instances[i].plane
        p.material.uniforms[`displacementScale_${this.count}`] = new THREE.Vector2(1,1);
        p.material.uniforms[`lightDirection_${this.count}`]    = new THREE.Vector3(.0, .0, 0); 
        var wp = p.position.clone()//new THREE.Vector3(0, 0, 0);
        //p.localToWorld(wp)
        var nxj = norm(wp.x,Math.abs(( w * d )/2),-Math.abs(( w * d )/2))
        var nyj = norm(wp.y,Math.abs(( w * d )/2),-Math.abs(( w * d )/2))
        var offSets = NODE.vec2(nxj-halfScale,nyj-halfScale)
        var newUV   = NODE.uv().mul(testscaling).add(offSets)
        //var scale = 4.0
        //newUV = newUV.mul(scale).add(0.5 * (1.0-scale)).add(NODE.vec2(0.0,0.0))
        var textureNode = NODE.texture(texture_,newUV)
        textureNode._TexId = `${i}_${this.count}` 
        if(p.material.positionNode){
          //var mouse = p.material.uniforms[`displacementScale_${this.count}`]
          //var ld    = p.material.uniforms[`lightDirection_${this.count}`]
          //const screenFXNode = NODE.uniform( mouse )
          //var ld  = NODE.uniform( ld ).add(NODE.vec3(.0, .0, 0))
          //const displace = textureNode.x.mul(screenFXNode.x).mul(NODE.normalLocal)
          p.material.colorNode = textureNode //p.material.colorNode.add(lighting(displacedNormal(textureNode,newUV),ld))
          //p.material.positionNode = p.material.positionNode.add( displace );
        }else{
          //var mouse = p.material.uniforms[`displacementScale_${this.count}`]
          //var ld    = p.material.uniforms[`lightDirection_${this.count}`]
          //const screenFXNode = NODE.uniform( mouse )
          //var ld  = NODE.uniform( ld ).add(NODE.vec3(.0, .0, 0))
          //const displace = textureNode.x.mul(screenFXNode.x).mul(NODE.normalLocal)
          //p.material.colorNode = textureNode .mul(2.0).sub(1.0)//lighting((displacedNormal(textureNode,newUV)),ld )
          //p.material.positionNode = NODE.positionLocal.add(displace);

          const displace = textureNode.r.mul(15.0).mul(NODE.normalLocal)
          p.material.colorNode = textureNode
          p.material.positionNode = NODE.positionLocal.add( displace );

        }
        }
        this.count++
      }


 
    fbm(op,wpscale,offset, seed, scale, persistance, lacunarity, redistribution, octaves,  iteration, terbulance,  ridge, patternNoise){
      var fn = NODE.func(`
      vec3 displacementNormalNoiseFBM_${fbmCount}(vec3 wp ,vec3 vn, float seed, float scale,float persistance,float lacunarity,float redistribution,int octaves, int iteration,bool terbulance, bool ridge,bool patternNoise){
        vec3 n =  displacementNormalNoiseFBM(wp,vn, seed,  scale, persistance, lacunarity, redistribution, octaves,  iteration, terbulance,  ridge, patternNoise);
        return vec3( n.r );
      }
      `,[displacementNormalNoiseFBM])


      for (var i = 0; i < this.instances.length; i++) {
        var p = this.instances[i].plane
        if(p.material.colorNode){

        var noiseOut  = fn.call({
          wp:NODE.positionWorld.add(offset).mul(wpscale),
          vn: NODE.normalLocal,
          seed:seed,
          scale:scale,
          persistance:persistance,
          lacunarity:lacunarity,
          redistribution:redistribution,
          octaves:NODE.int(octaves),
          iteration:NODE.int(iteration),
          terbulance:terbulance,
          ridge:ridge,
          patternNoise:patternNoise
        })
        p.material.colorNode= p.material.colorNode[op](noiseOut)
      }else{
        p.material.colorNode = fn.call({
          wp:NODE.positionWorld.add(offset).mul(wpscale),
          vn: NODE.normalLocal,
          seed:seed,
          scale:scale,
          persistance:persistance,
          lacunarity:lacunarity,
          redistribution:redistribution,
          octaves:NODE.int(octaves),
          iteration:NODE.int(iteration),
          terbulance:terbulance,
          ridge:ridge,
          patternNoise:patternNoise
        })

      }
      }
      fbmCount++
    }


    lighting(ld){
      var fn = NODE.func(`
      vec3 light_(vec3 n, vec3 ld ) {
        return light( n,ld);
      }
      `,[light])
      for (var i = 0; i < this.instances.length; i++) {
        var p = this.instances[i].plane
        p.material.colorNode = fn.call({
          n:p.material.colorNode,
          ld:ld,
        })
      }
    }


    updateTextureNode(callbBack){
      for (var i = 0; i < this.instances.length; i++) {
        var p = this.instances[i].plane
        p.material.colorNode.traverse((t,r)=>{
          callbBack(t,r)
        })
      }
    }

    updateCurrentNodeTexture(callbBack){
      for (var i = 0; i < this.instances.length; i++) {
        var p = this.instances[i].plane
        callbBack(p)
        }
      }

    createNewMesh(shardedGeometry){
      const width  = shardedGeometry.parameters.width
      const height = shardedGeometry.parameters.height
      const heightSegments = shardedGeometry.parameters.heightSegments
      const widthSegments  = shardedGeometry.parameters.widthSegments
      const material = new NODE.MeshBasicNodeMaterial();
      const quad     = new Quad(width,height,widthSegments,heightSegments)
      quad.plane     = new THREE.Mesh( shardedGeometry, material );
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

    createDimensions(){
      const w = this.quadData.width
      const d = this.quadData.dimensions
      const shardedGeometry = this.quadTreeconfig.config.arrybuffers[w]
      for (var i = 0; i < d; i++) {
        var i_ = ((i*(w-1))+i)+((-(w/2))*(d-1))
        for (var j = 0; j < d; j++) {
          var j_ = ((j*(w-1))+j)+((-(w/2))*(d-1))
          var q = this.createNewMesh(shardedGeometry).setPosition( [i_,-j_,0], 'dimensions')
          q.quadTree = new QuadTrees.QuadTreeLoD()
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
  
  /*
  
    var cbt = new CubeTexture()
  var t = cbt.get(this.rend)
  console.log(t)

  this. q = new Quad(50,50,250,250,2)
  this. q.createQuadTree(2)
  this. q.createDimensions()
  this. q.addTexture  (t[0])
  this. q.lighting    (NODE.vec3(0,0,0))
  this.rend.scene.add( ...this. q.instances.map(x=>x.plane) );
  */