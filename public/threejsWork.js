
import * as THREE from 'https://unpkg.com/three@0.159/build/three.module.js';
import {fas} from './t.js'

let BYTE_PER_LENTH = 5;
addEventListener('message', ({ data }) => {
    var arr = new Float32Array(data);


    //updating the data from the worker thread 
    let dataChanged = 5 * BYTE_PER_LENTH;
    arr[0] *= dataChanged;
    //Sending to the main thread 
    postMessage('Updated');
})