
import * as THREE from 'https://unpkg.com/three@0.159/build/three.module.js';
import {fas} from './t.js'

function toSphereSegement(plane,cnt,r) {
  let center = new THREE.Vector3().copy(cnt);
  let localCenter = new THREE.Vector3();
  let v3 = new THREE.Vector3();

	const u = new THREE.Vector3();   // create once
	const w = new THREE.Vector3();   // create once

  let p = plane
    p.worldToLocal(localCenter.copy(center));
    let pos = p.geometry.attributes.position;
    for(let i = 0; i < pos.count; i++){
      v3.fromBufferAttribute(pos, i);
      v3.sub(localCenter);
      v3.normalize().multiplyScalar(r).add(localCenter);
      pos.setXYZ(i, v3.x, v3.y, v3.z);

      /*u.x += 0.1;
      u.sub(localCenter);
      u.normalize().multiplyScalar(r).add(localCenter);
  
      w.y += 0.1;
      w.sub(localCenter);
      w.normalize().multiplyScalar(r).add(localCenter);

      u.sub(v3).cross(w.sub(v3)).normalize();      
      p.geometry.attributes.normal.setXYZ(i,u.x,u.y,u.z)*/

    }
}



function doCalculation(data, cb) {
    let result = null, err = null

let wh = data.parentPositionVector[data.parentPositionVector.length - 1];

//console.log(wh)

const geometry = new THREE.PlaneGeometry( wh, wh );
const material = new THREE.MeshBasicMaterial( );
const parent = new THREE.Mesh( geometry, material );
parent.position.set(...data.parentPositionVector)

if (data.side=='right'){
    parent.rotation.y =  Math.PI/2;
}else if(data.side=='left'){
    parent.rotation.y =  -Math.PI/2;
}else if(data.side=='top'){
    parent.rotation.x = -Math.PI/2;
}else if(data.side=='bottom'){
    parent.rotation.x =  Math.PI/2;
}else if(data.side=='front'){
    //pass
}else if(data.side=='back'){
    parent.rotation.y =  Math.PI;
}
    
    var arrp = new Float32Array(data.positionBuffer);
    //var arrn = new Float32Array(data.normalBuffer);

    let f2 =  JSON.parse("[" + data.positionStr + "]")
   // let f2n = JSON.parse("[" + data.normalStr + "]")

    let f3 = Float32Array.from(f2)
   // let f3n = Float32Array.from(f2n)

    let geoCore = new THREE.BufferGeometry()
    geoCore.setAttribute( 'position', new THREE.Float32BufferAttribute( f3, 3 ) );
    //geoCore.setAttribute( 'normal', new THREE.Float32BufferAttribute( f3n, 3 ) );
   // geoCore.translate(...data.positionVector)
    
    let m = new THREE.Mesh(geoCore,new THREE.Material())
    m.position.set(...data.positionVector)
    parent.add(m)

    toSphereSegement(m,new THREE.Vector3(...data.center),data.radius)
    arrp.set(geoCore.attributes.position.array)
    //arrn.set(geoCore.attributes.normal.array)

    result = 'complete'
    cb(err, result)
  }

  self.onmessage = function(msg) {
    const payload = msg.data
    //console.log(payload)
    doCalculation(payload, function(err, result) {
      const msg = {
        err,
        payload: result
      }
      self.postMessage(msg)
    })
  }