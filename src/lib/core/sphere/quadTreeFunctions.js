import * as THREE          from 'three';
import {norm}              from './utils'
import * as NODE from 'three/nodes';
import {
  light
} from  './../shaders/glslFunctions'

var lighting = NODE.glslFn(`
vec3 light_(vec3 n, vec3 ld ) {
  return light( n,ld);
}
`,[light])


export function frontsetData(obj){
    console.log('f')
    var position = obj.config.position
    var scale = obj.config.scale
    var p = new THREE.Vector3(position.x,position.y,position.z)
    var radius = obj.config.radius
    var wp = new THREE.Vector3();
    obj.child.plane.localToWorld(wp)
    wp = wp.sub(p).divideScalar(scale)
    var nxj = norm(wp.x,Math.abs(obj.starting/2),-Math.abs(obj.starting/2))
    var nyj = norm(wp.y,Math.abs(obj.starting/2),-Math.abs(obj.starting/2))
    var offSets = NODE.vec2(nxj-obj.halfScale,nyj-obj.halfScale)
    var newUV = NODE.uv().mul(obj.scaling).add(offSets)
    var textureNode = NODE.texture( obj.texture,newUV)
    var p = obj.child.plane
    var cnt = obj.cnt.clone()
    p.worldToLocal(cnt)
    if(p.material.colorNode){
      //const displace = NODE.normalLocal.mul( p.material.positionNode.add(textureNode.x.mul(5)) );
      //p.material.colorNode = p.material.colorNode.add(lighting(displacedNormal(textureNode,newUV)))
      //p.material.positionNode =  NODE.positionLocal.add( displace );
    }else{
      //p.material.colorNode = textureNode //p.material.colorNode.add(lighting(displacedNormal(textureNode,newUV),ld))
      //const displace = textureNode.z.mul(5500.0).mul(NODE.positionLocal.sub(cnt).normalize())
      //p.material.colorNode = textureNode
      //p.material.positionNode =  p.material.positionNode.add( displace );
      const displace = textureNode.z.mul(1.0).mul(NODE.positionLocal.sub(cnt).normalize())
      p.material.colorNode = textureNode
      p.material.colorNode = lighting.call({n:p.material.colorNode,ld:NODE.vec3(0,0,0)})
      var newP = NODE.float(radius).mul((NODE.positionLocal.sub(cnt).normalize())).add(cnt)
      p.material.positionNode = newP.add( displace );

    }

  }  


  export function  backsetData(obj){
    console.log('b')
    var scale = obj.config.scale
    var position = obj.config.position
    var p = new THREE.Vector3(position.x,position.y,position.z)
    var radius = obj.config.radius
    var wp = new THREE.Vector3();
    obj.child.plane.localToWorld(wp)
    wp = wp.sub(p).divideScalar(scale)
    wp.x = - wp.x
    var nxj = norm(wp.x,Math.abs(obj.starting/2),-Math.abs(obj.starting/2))
    var nyj = norm(wp.y,Math.abs(obj.starting/2),-Math.abs(obj.starting/2))
    var offSets = NODE.vec2(nxj-obj.halfScale,nyj-obj.halfScale)
    var newUV = NODE.uv().mul(obj.scaling).add(offSets)
    var textureNode = NODE.texture( obj.texture,newUV)
    var p = obj.child.plane
    var cnt = obj.cnt
    p.worldToLocal(obj.cnt)
    if(p.material.colorNode){
      //const displace = NODE.normalLocal.mul( p.material.positionNode.add(textureNode.x.mul(5)) );
      //p.material.colorNode = p.material.colorNode.add(lighting(displacedNormal(textureNode,newUV)))
      //p.material.positionNode =  NODE.positionLocal.add( displace );
    }else{
      //p.material.colorNode = textureNode //p.material.colorNode.add(lighting(displacedNormal(textureNode,newUV),ld))
      //const displace = textureNode.z.mul(5500.0).mul(NODE.positionLocal.sub(cnt).normalize())
      //p.material.colorNode = textureNode
      //p.material.positionNode =  p.material.positionNode.add( displace );

      const displace = textureNode.z.mul(1.0).mul(NODE.positionLocal.sub(cnt).normalize())
      p.material.colorNode = textureNode
      p.material.colorNode = lighting.call({n:p.material.colorNode,ld:NODE.vec3(0,0,0)})
      var newP = NODE.float(radius).mul((NODE.positionLocal.sub(cnt).normalize())).add(cnt)
      p.material.positionNode = newP.add( displace );

    }

  }
  
  
  export function rightsetData(obj){
    console.log('r')
    var scale = obj.config.scale
    var position = obj.config.position
    var p = new THREE.Vector3(position.x,position.y,position.z)
    var radius = obj.config.radius
    var wp = new THREE.Vector3();
    obj.child.plane.localToWorld(wp)
    wp = wp.sub(p)
    wp.x = -1*(wp.x + wp.z)
    wp.divideScalar(scale)
    var nxj = norm(wp.x,Math.abs(obj.starting/2),-Math.abs(obj.starting/2))
    var nyj = norm(wp.y,Math.abs(obj.starting/2),-Math.abs(obj.starting/2))
    var offSets = NODE.vec2(nxj-obj.halfScale,nyj-obj.halfScale)
    var newUV = NODE.uv().mul(obj.scaling).add(offSets)
    var textureNode = NODE.texture( obj.texture,newUV)
    var p = obj.child.plane
    var cnt = obj.cnt
    p.worldToLocal(obj.cnt)
    if(p.material.colorNode){
      //const displace = NODE.normalLocal.mul( p.material.positionNode.add(textureNode.x.mul(5)) );
      //p.material.colorNode = p.material.colorNode.add(lighting(displacedNormal(textureNode,newUV)))
      //p.material.positionNode =  NODE.positionLocal.add( displace );
    }else{
      //p.material.colorNode = textureNode //p.material.colorNode.add(lighting(displacedNormal(textureNode,newUV),ld))
      //const displace = textureNode.z.mul(5500.0).mul(NODE.positionLocal.sub(cnt).normalize())
      //p.material.colorNode = textureNode
      //p.material.positionNode =  p.material.positionNode.add( displace );

      const displace = textureNode.z.mul(1.0).mul(NODE.positionLocal.sub(cnt).normalize())
      p.material.colorNode = textureNode
      p.material.colorNode = lighting.call({n:p.material.colorNode,ld:NODE.vec3(0,0,0)})
      var newP = NODE.float(radius).mul((NODE.positionLocal.sub(cnt).normalize())).add(cnt)
      p.material.positionNode = newP.add( displace );

    }

  } 
  
  
  export function  leftsetData(obj){
    console.log('l')
    var scale = obj.config.scale
    var position = obj.config.position
    var p = new THREE.Vector3(position.x,position.y,position.z)
    var radius = obj.config.radius
    var wp = new THREE.Vector3();
    obj.child.plane.localToWorld(wp)
    wp = wp.sub(p)
    wp.x = (wp.z - wp.x)
    wp.divideScalar(scale)
    var nxj = norm(wp.x,Math.abs(obj.starting/2),-Math.abs(obj.starting/2))
    var nyj = norm(wp.y,Math.abs(obj.starting/2),-Math.abs(obj.starting/2))
    var offSets = NODE.vec2(nxj-obj.halfScale,nyj-obj.halfScale)
    var newUV = NODE.uv().mul(obj.scaling).add(offSets)
    var textureNode = NODE.texture( obj.texture,newUV)
    var p = obj.child.plane
    var cnt = obj.cnt
    p.worldToLocal(obj.cnt)
    if(p.material.colorNode){
      //const displace = NODE.normalLocal.mul( p.material.positionNode.add(textureNode.x.mul(5)) );
      //p.material.colorNode = p.material.colorNode.add(lighting(displacedNormal(textureNode,newUV)))
      //p.material.positionNode =  NODE.positionLocal.add( displace );
    }else{
      //p.material.colorNode = textureNode //p.material.colorNode.add(lighting(displacedNormal(textureNode,newUV),ld))
      //const displace = textureNode.z.mul(5500.0).mul(NODE.positionLocal.sub(cnt).normalize())
      //p.material.colorNode = textureNode
      //p.material.positionNode =  p.material.positionNode.add( displace );

      const displace = textureNode.z.mul(1.0).mul(NODE.positionLocal.sub(cnt).normalize())
      p.material.colorNode = textureNode
      p.material.colorNode = lighting.call({n:p.material.colorNode,ld:NODE.vec3(0,0,0)})
      var newP = NODE.float(radius).mul((NODE.positionLocal.sub(cnt).normalize())).add(cnt)
      p.material.positionNode = newP.add( displace );

    }

  } 
  
  
  export function topsetData(obj){
    console.log('t')
    var scale = obj.config.scale
    var position = obj.config.position
    var p = new THREE.Vector3(position.x,position.y,position.z)
    var radius = obj.config.radius
    var wp = new THREE.Vector3();
    obj.child.plane.localToWorld(wp)
    wp = wp.sub(p)
    wp.y = -1*(wp.z + wp.y)
    wp.divideScalar(scale)
    var nxj = norm(wp.x,Math.abs(obj.starting/2),-Math.abs(obj.starting/2))
    var nyj = norm(wp.y,Math.abs(obj.starting/2),-Math.abs(obj.starting/2))
    var offSets = NODE.vec2(nxj-obj.halfScale,nyj-obj.halfScale)
    var newUV = NODE.uv().mul(obj.scaling).add(offSets)
    var textureNode = NODE.texture( obj.texture,newUV)
    var p = obj.child.plane
    var cnt = obj.cnt
    p.worldToLocal(obj.cnt)
    if(p.material.colorNode){
      //const displace = NODE.normalLocal.mul( p.material.positionNode.add(textureNode.x.mul(5)) );
      //p.material.colorNode = p.material.colorNode.add(lighting(displacedNormal(textureNode,newUV)))
      //p.material.positionNode =  NODE.positionLocal.add( displace );
    }else{
      //p.material.colorNode = textureNode //p.material.colorNode.add(lighting(displacedNormal(textureNode,newUV),ld))
      //const displace = textureNode.z.mul(5500.0).mul(NODE.positionLocal.sub(cnt).normalize())
      //p.material.colorNode = textureNode
      //p.material.positionNode =  p.material.positionNode.add( displace );

      const displace = textureNode.z.mul(1.0).mul(NODE.positionLocal.sub(cnt).normalize())
      p.material.colorNode = textureNode
      p.material.colorNode = lighting.call({n:p.material.colorNode,ld:NODE.vec3(0,0,0)})
      var newP = NODE.float(radius).mul((NODE.positionLocal.sub(cnt).normalize())).add(cnt)
      p.material.positionNode = newP.add( displace );

    }

  } 
  
  export function  bottomsetData(obj){
    console.log('bo')
    var scale = obj.config.scale
    var position = obj.config.position
    var p = new THREE.Vector3(position.x,position.y,position.z)
    var radius = obj.config.radius
    var wp = new THREE.Vector3();
    obj.child.plane.localToWorld(wp)
    wp = wp.sub(p)
    wp.y = (-wp.y + wp.z)
    wp.divideScalar(scale)
    var nxj = norm(wp.x,Math.abs(obj.starting/2),-Math.abs(obj.starting/2))
    var nyj = norm(wp.y,Math.abs(obj.starting/2),-Math.abs(obj.starting/2))
    var offSets = NODE.vec2(nxj-obj.halfScale,nyj-obj.halfScale)
    var newUV = NODE.uv().mul(obj.scaling).add(offSets)
    var textureNode = NODE.texture( obj.texture,newUV)
    var p = obj.child.plane
    var cnt = obj.cnt
    p.worldToLocal(obj.cnt)
    if(p.material.colorNode){
      //const displace = NODE.normalLocal.mul( p.material.positionNode.add(textureNode.x.mul(5)) );
      //p.material.colorNode = p.material.colorNode.add(lighting(displacedNormal(textureNode,newUV)))
      //p.material.positionNode =  NODE.positionLocal.add( displace );
    }else{
      //p.material.colorNode = textureNode //p.material.colorNode.add(lighting(displacedNormal(textureNode,newUV),ld))
      //const displace = textureNode.z.mul(5500.0).mul(NODE.positionLocal.sub(cnt).normalize())
      //p.material.colorNode = textureNode
      //p.material.positionNode =  p.material.positionNode.add( displace );

      const displace = textureNode.z.mul(1.0).mul(NODE.positionLocal.sub(cnt).normalize())
      p.material.colorNode = textureNode
      p.material.colorNode = lighting.call({n:p.material.colorNode,ld:NODE.vec3(0,0,0)})
      var newP = NODE.float(radius).mul((NODE.positionLocal.sub(cnt).normalize())).add(cnt)
      p.material.positionNode = newP.add( displace );
    }

  }

