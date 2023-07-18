import React, { useState, useEffect, useRef } from 'react';
import BuildViewPort from './buildViewPort';
import viewGL from '../lib/viewGL'
import * as THREE from 'three';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

 function asyncCall(canvas, viewGL) {
  //viewGL.initPlanet();
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
          width: '200px',
          height: '200px',
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
