import * as THREE from 'three/tsl'
import { QuadGeometry, NormalizedQuadGeometry } from '../geometry.js'

export class QuadWorker {
    constructor(_worker) {
      this.worker = _worker
    }
    
    setWork({ payload }) {
      this.worker.postMessage(payload)
    }
  
    getWork({ quad, buffers }){
      this.worker.onmessage =(_)=>{

      }
    }
  }
  