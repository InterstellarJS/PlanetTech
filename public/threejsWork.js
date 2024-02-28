
import * as THREE from 'https://unpkg.com/three@0.159/build/three.module.js';
import {fas} from './t.js'

/*let BYTE_PER_LENTH = 15;
addEventListener('message', (e) => {
    var arr = new Float32Array(e.data.buffMemLength);
    let f2 =  JSON.parse("[" + e.data.stra + "]")
    let f3 = Float32Array.from(f2)
    arr.set(f3)
    let maximum = 2+100000
    let minimum = 0
    var randomnumber = Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
    console.log(randomnumber)
    //updating the data from the worker thread 
    let dataChanged = 5 * BYTE_PER_LENTH;
    arr[randomnumber] *= dataChanged;
    //Sending to the main thread 
    postMessage('Updated');
})*/

let BYTE_PER_LENTH = 15
function doCalculation(data, cb) {
    let result = null, err = null
    
    var arr = new Float32Array(data.buffMemLength);
    let f2 =  JSON.parse("[" + data.stra + "]")
    let f3 = Float32Array.from(f2)
    arr.set(f3)
    let maximum = 2+1000000
    let minimum = 0
    var randomnumber = Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
    //console.log(randomnumber)
    //updating the data from the worker thread 
    let dataChanged = 5 * BYTE_PER_LENTH;
    arr[randomnumber] *= dataChanged;
    //Sending to the main thread 
    result = 'complete'
    cb(err, result)
    
  }
  // Handle incoming messages
  self.onmessage = function(msg) {
    const {id, payload} = msg.data
    
    doCalculation(payload, function(err, result) {
      const msg = {
        id,
        err,
        payload: result
      }
      self.postMessage(msg)
    })
  }