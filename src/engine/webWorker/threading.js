
export class ThreadController {
    constructor(_worker) {
      this.worker = _worker
    }
    
    setPayload( payload ) {
      this.worker.postMessage(payload)
    }
  
    getPayload( callBack ){
      this.worker.onmessage =(payload)=>{
        callBack(payload)
       }
    }
  }
  