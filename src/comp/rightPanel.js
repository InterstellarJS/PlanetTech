import React, { useState, useEffect, useRef } from 'react';
import BuildViewPort from './buildViewPort';
import viewGL from '../lib/viewGL'
import * as THREE from 'three';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

  // Function to create the canvas dynamically
  function createCanvas(width, height) {
    const canvas = document.getElementById("myCanvas");
    canvas.width = width;
    canvas.height = height;
    return canvas;
}



 function  asyncCall(canvasI, viewGL) {
  // Get the canvas and its context
// Set the source of the second image
var src2 = "./worldTextures/right_image.png";
// Set the source of the first image
var src1 = "./worldTextures/front_image.png";

const canvas = createCanvas(512, 512);
const ctx = canvas.getContext("2d");

const image1 = new Image();
const image2 = new Image();



        image1.onload = () => {
            // Once the first image is loaded, draw it on the left side of the canvas
            ctx.drawImage(image1, 0, 0, 512/2, 512/2);

            image2.onload = () => {
                // Once the second image is loaded, draw it on the right side of the canvas
                ctx.drawImage(image2, 512/2, 0, 512/2, 512/2);
                viewGL.initPlanet(canvas);

            };

            // Set the source of the second image
            image2.src = src2;
        };

        // Set the source of the first image
        image1.src = src1;

}

const RightPanel = () => {
  const canvasRef = useRef();
  const [isBuildViewPortVisible, setIsBuildViewPortVisible] = useState(false);
  const [sliderValue, setSliderValue] = useState(0); // Initial value for the slider

  useEffect(() => {
    console.log('right')
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
  }, []);

  useEffect(() => {
    asyncCall(canvasRef.current, viewGL);
  }, []);

  useEffect(() => {
    viewGL.updateMeshPosition(sliderValue);
  }, [sliderValue]);


  // function to handle the download button click event
  const handleDownloadClick = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = 'canvas-image.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleBuildClick = () => {
    setIsBuildViewPortVisible(true);
  };

  const handleSliderChange = (value) => {
    setSliderValue(value);
    // Handle the slider value change here
  };

  return (
    <div
      id="right-panel"
      style={{
        position: 'absolute',
        right: '0',
        top: '0',
        width: '23%',
        height: '100%',
        backgroundColor: 'red',
      }}
    >
      <canvas
        ref={canvasRef}
        id="myCanvas"
        style={{
          position: 'absolute',
          top: '0',
          left: '0',
          width: '1024px',
          height: '512px',
          backgroundColor: 'green',
        }}
      />
      <button style={{ position: 'absolute', bottom: '0' }} onClick={handleDownloadClick}>
        Download
      </button>
      <button id="build" style={{ position: 'absolute', bottom: '0' }} onClick={handleBuildClick}>
        Build
      </button>
      {/* Add the slider component */}
      <Slider
        value={sliderValue}
        min={-100}
        max={100}
        onChange={handleSliderChange}
        style={{ position: 'absolute', top: '250px', width: '80%', left: '10%' }}
      />
      {/* Display the current value of the slider */}
      <div style={{ position: 'absolute', bottom: '80px', width: '100%', textAlign: 'center' }}>
        Slider Value: {sliderValue}
      </div>
      {isBuildViewPortVisible && <BuildViewPort isVisible={setIsBuildViewPortVisible} />}
    </div>
  );
};

export default RightPanel;
