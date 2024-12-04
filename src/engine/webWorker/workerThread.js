
export function workersSRC(currentGeometry,params){
    return `
    import * as THREE from 'https://unpkg.com/three@0.169/build/three.module.js';
    //todo: add the ability for dynamic imports like (params.map)


    ${params.map(code=>{
        return code.toString().replaceAll('three__WEBPACK_IMPORTED_MODULE_1__','THREE')
    }).join('\n')}


    function init( payload ){
    
        const positionBuffer = new Float32Array(payload.sharedArrayPosition );
        const normalBuffer   = new Float32Array(payload.sharedArrayNormal   );
        const uvBuffer       = new Float32Array(payload.sharedArrayUv       );
        const indexBuffer    = new Uint32Array (payload.sharedArrayIndex    );
        const dirVectBuffer  = new Float32Array(payload.sharedArrayDirVect  );

        let geometry = new ${currentGeometry}( payload.size, payload.size, payload.resolution, payload.resolution, payload.radius)

        let matrix  = payload.matrixRotationData.propMehtod ? new THREE.Matrix4()[[payload.matrixRotationData.propMehtod]](payload.matrixRotationData.input) : new THREE.Matrix4() 

        geometry._setMatrix({ matrix })

        geometry._setOffset({ offset: payload.offset })

        geometry._threadingBuild({
            positionBuffer,
            normalBuffer,
            uvBuffer,
            indexBuffer,
            dirVectBuffer
        })
 
        return{
            positionBuffer,
            normalBuffer,
            uvBuffer,
            indexBuffer,
            dirVectBuffer
        }
    }
        
    self.onmessage = function(msg) {
        const payload = msg.data
        let outputBuffers = init(payload)
        self.postMessage({msg:'Complete',data:[1,2,3]})
    }
    `
}