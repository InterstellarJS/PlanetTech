import React, { useState, useEffect, useRef } from 'react';
import viewGL from '../lib/viewGL'

const ViewPort = () => {

  // Create a ref for the canvas element
  const canvasRef = useRef(null);
  const canvasContainerRef = useRef(null);

  // When the component mounts, draw a rectangle with a random color on the canvas
  useEffect(() => {
    let ccr = canvasContainerRef.current
    viewGL.initViewPort(canvasRef.current)
    viewGL.start()
    viewGL.initPlayer()
    viewGL.update()


    window.addEventListener('resize',function resizing() {
          viewGL.onWindowResize(ccr.offsetWidth,ccr.offsetHeight)
        })
    console.log('viewPort');
  }, []);



  return (
    <div ref={canvasContainerRef} id='canvasContainer' style={{
      position: 'absolute',
      left: '0',
      top:  '0',
      width: '100%',
      height: '100%',
    }}>
    <canvas ref={canvasRef} />
    </div>
  );
}

export default ViewPort;
