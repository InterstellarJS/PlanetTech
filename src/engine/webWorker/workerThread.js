
export function workersSRC(params){
    return `
    import * as THREE from 'https://unpkg.com/three@0.169/build/three.module.js';
    
    ${params.map(code=>{
        return code.toString().replaceAll('three__WEBPACK_IMPORTED_MODULE_1__','THREE')
    }).join('\n')}


    function init(payload){
        const positionBuffer      = new Float32Array(payload.sharedArrayPosition );
        const normalBuffer        = new Float32Array(payload.sharedArrayNormal   );
        const uvBuffer            = new Float32Array(payload.sharedArrayUv       );
        const indexBuffer         = new Uint32Array (payload.sharedArrayIndex    );
    }
        
    self.onmessage = function(msg) {
      const payload = msg.data
      //when work's done 
       console.log(QuadGeometry)
       init(payload)
      self.postMessage({msg:'Done',data:[1,2,3]})
    }
    `
}