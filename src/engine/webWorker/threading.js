import * as THREE from 'three/tsl'
import { QuadGeometry, NormalizedQuadGeometry } from '../geometry.js'

export class QuadWorker {
    constructor(_worker) {
      this.worker = _worker
    }
    
    setPayload( payload ) {
      this.worker.postMessage(payload)
    }
  
    getPayload( buffers ){
      this.worker.onmessage =(payload)=>{
        console.log(buffers)
       }
    }
  }
  