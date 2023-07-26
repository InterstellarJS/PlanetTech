import React, { useState, useEffect, useRef } from 'react';
import BuildViewPort from './buildViewPort';
import viewGL from '../lib/viewGL'
import * as THREE from 'three';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import TextureAtlas from '../lib/core/textures/textureAtlas'
import './styles/rightPanel.css';


async function loadImageToCanvas(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = function () {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      resolve({canvas,img});
    };
    img.onerror = function () {
      reject(new Error(`Failed to load image from URL: ${url}`));
    };
    img.src = url;
  });
}

async function loadImagesToCanvases(urls) {
  const canvasUrls = [];

  for (const url of urls) {
    try {
      const canvasUrl = await loadImageToCanvas(url);
      canvasUrls.push(canvasUrl.canvas.toDataURL());
    } catch (error) {
      console.error(error);
      // Handle errors here if necessary
    }
  }

  return canvasUrls;
}


async function loadImagesToCanvasesTop(urls) {
  const canvasUrls = [];

  for (const [i,url] of urls.entries()) {
    try {
      const canvasImg = await loadImageToCanvas(url);
      if (i === 1){
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = canvasImg.img.width;
        canvas.height = canvasImg.img.height;
        ctx.drawImage(canvasImg.img, 0, 0);

        // Rotate the first canvas by 90 degrees in the negative direction.
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(Math.PI);
        ctx.drawImage(canvasImg.img, -canvasImg.img.height / 2, -canvasImg.img.width / 2);
        ctx.restore();

        canvasUrls.push(canvas.toDataURL());

      }else if(i === 3){
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = canvasImg.img.width;
        canvas.height = canvasImg.img.height;
        ctx.drawImage(canvasImg.img, 0, 0);

        // Rotate the first canvas by 90 degrees in the negative direction.
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(Math.PI/2);
        ctx.drawImage(canvasImg.img, -canvasImg.img.height / 2, -canvasImg.img.width / 2);
        ctx.restore();

        canvasUrls.push(canvas.toDataURL());
      }else if(i === 5){
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = canvasImg.img.width;
        canvas.height = canvasImg.img.height;
        ctx.drawImage(canvasImg.img, 0, 0);

        // Rotate the first canvas by 90 degrees in the negative direction.
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(-Math.PI/2);
        ctx.drawImage(canvasImg.img, -canvasImg.img.height / 2, -canvasImg.img.width / 2);
        ctx.restore();

        canvasUrls.push(canvas.toDataURL());
      }
      
      else{
        canvasUrls.push(canvasImg.canvas.toDataURL());

      }
    } catch (error) {
      console.error(error);
      // Handle errors here if necessary
    }
  }

  return canvasUrls;
}



async function loadImagesToCanvasesRight(urls) {
  const canvasUrls = [];

  for (const [i,url] of urls.entries()) {
    try {
      const canvasImg = await loadImageToCanvas(url);
      if (i === 1){
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = canvasImg.img.width;
        canvas.height = canvasImg.img.height;
        ctx.drawImage(canvasImg.img, 0, 0);

        // Rotate the first canvas by 90 degrees in the negative direction.
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(Math.PI/2);
        ctx.drawImage(canvasImg.img, -canvasImg.img.height / 2, -canvasImg.img.width / 2);
        ctx.restore();

        canvasUrls.push(canvas.toDataURL());

      } else if(i == 7){
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = canvasImg.img.width;
        canvas.height = canvasImg.img.height;
        ctx.drawImage(canvasImg.img, 0, 0);

        // Rotate the first canvas by 90 degrees in the negative direction.
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(-Math.PI/2);
        ctx.drawImage(canvasImg.img, -canvasImg.img.height / 2, -canvasImg.img.width / 2);
        ctx.restore();

        canvasUrls.push(canvas.toDataURL());
      }
      
      else{
        canvasUrls.push(canvasImg.canvas.toDataURL());

      }
    } catch (error) {
      console.error(error);
      // Handle errors here if necessary
    }
  }

  return canvasUrls;
}


async function loadImagesToCanvasesLeft(urls) {
  const canvasUrls = [];

  for (const [i,url] of urls.entries()) {
    try {
      const canvasImg = await loadImageToCanvas(url);
      if (i === 1){
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = canvasImg.img.width;
        canvas.height = canvasImg.img.height;
        ctx.drawImage(canvasImg.img, 0, 0);

        // Rotate the first canvas by 90 degrees in the negative direction.
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(-Math.PI/2);
        ctx.drawImage(canvasImg.img, -canvasImg.img.height / 2, -canvasImg.img.width / 2);
        ctx.restore();

        canvasUrls.push(canvas.toDataURL());

      } else if(i == 7){
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = canvasImg.img.width;
        canvas.height = canvasImg.img.height;
        ctx.drawImage(canvasImg.img, 0, 0);

        // Rotate the first canvas by 90 degrees in the negative direction.
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(Math.PI/2);
        ctx.drawImage(canvasImg.img, -canvasImg.img.height / 2, -canvasImg.img.width / 2);
        ctx.restore();

        canvasUrls.push(canvas.toDataURL());
      }
      
      else{
        canvasUrls.push(canvasImg.canvas.toDataURL());

      }
    } catch (error) {
      console.error(error);
      // Handle errors here if necessary
    }
  }

  return canvasUrls;
}


async function loadImagesToCanvasesBottom(urls) {
  const canvasUrls = [];

  for (const [i,url] of urls.entries()) {
    try {
      const canvasImg = await loadImageToCanvas(url);
      if (i === 3){
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = canvasImg.img.width;
        canvas.height = canvasImg.img.height;
        ctx.drawImage(canvasImg.img, 0, 0);

        // Rotate the first canvas by 90 degrees in the negative direction.
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(-Math.PI/2);
        ctx.drawImage(canvasImg.img, -canvasImg.img.height / 2, -canvasImg.img.width / 2);
        ctx.restore();

        canvasUrls.push(canvas.toDataURL());

      } else if(i == 5){
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = canvasImg.img.width;
        canvas.height = canvasImg.img.height;
        ctx.drawImage(canvasImg.img, 0, 0);

        // Rotate the first canvas by 90 degrees in the negative direction.
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(Math.PI/2);
        ctx.drawImage(canvasImg.img, -canvasImg.img.height / 2, -canvasImg.img.width / 2);
        ctx.restore();

        canvasUrls.push(canvas.toDataURL());
      }else if(i == 7){
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = canvasImg.img.width;
        canvas.height = canvasImg.img.height;
        ctx.drawImage(canvasImg.img, 0, 0);

        // Rotate the first canvas by 90 degrees in the negative direction.
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(Math.PI);
        ctx.drawImage(canvasImg.img, -canvasImg.img.height / 2, -canvasImg.img.width / 2);
        ctx.restore();

        canvasUrls.push(canvas.toDataURL());
      }
      
      else{
        canvasUrls.push(canvasImg.canvas.toDataURL());

      }
    } catch (error) {
      console.error(error);
      // Handle errors here if necessary
    }
  }

  return canvasUrls;
}



async function loadImagesToCanvasesBack(urls) {
  const canvasUrls = [];

  for (const [i,url] of urls.entries()) {
    try {
      const canvasImg = await loadImageToCanvas(url);
      if (i === 1){
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = canvasImg.img.width;
        canvas.height = canvasImg.img.height;
        ctx.drawImage(canvasImg.img, 0, 0);

        // Rotate the first canvas by 90 degrees in the negative direction.
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(-Math.PI);
        ctx.drawImage(canvasImg.img, -canvasImg.img.height / 2, -canvasImg.img.width / 2);
        ctx.restore();

        canvasUrls.push(canvas.toDataURL());

      }else if(i == 7){
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = canvasImg.img.width;
        canvas.height = canvasImg.img.height;
        ctx.drawImage(canvasImg.img, 0, 0);

        // Rotate the first canvas by 90 degrees in the negative direction.
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(Math.PI);
        ctx.drawImage(canvasImg.img, -canvasImg.img.height / 2, -canvasImg.img.width / 2);
        ctx.restore();

        canvasUrls.push(canvas.toDataURL());
      }
      
      else{
        canvasUrls.push(canvasImg.canvas.toDataURL());

      }
    } catch (error) {
      console.error(error);
      // Handle errors here if necessary
    }
  }

  return canvasUrls;
}




 async function  asyncCall(canvasI, viewGL) {

  var imageURLsf = [
    "./worldTextures/srcContainer.jpg",
    "./worldTextures/top_image.png",
    "./worldTextures/srcContainer.jpg",

    "./worldTextures/left_image.png",
    "./worldTextures/front_image.png",
    "./worldTextures/right_image.png",
    
    "./worldTextures/srcContainer.jpg",
    "./worldTextures/bottom_image.png",
    "./worldTextures/srcContainer.jpg",
];

var imageURLst = [
  "./worldTextures/srcContainer.jpg",
  "./worldTextures/back_image.png",
  "./worldTextures/srcContainer.jpg",

  "./worldTextures/left_image.png",
  "./worldTextures/top_image.png",
  "./worldTextures/right_image.png",
  
  "./worldTextures/srcContainer.jpg",
  "./worldTextures/front_image.png",
  "./worldTextures/srcContainer.jpg",
];



var imageURLsr = [
  "./worldTextures/srcContainer.jpg",
  "./worldTextures/top_image.png",
  "./worldTextures/srcContainer.jpg",

  "./worldTextures/front_image.png",
  "./worldTextures/right_image.png",
  "./worldTextures/back_image.png",
  
  "./worldTextures/srcContainer.jpg",
  "./worldTextures/bottom_image.png",
  "./worldTextures/srcContainer.jpg",
];


var imageURLsl = [
  "./worldTextures/srcContainer.jpg",
  "./worldTextures/top_image.png",
  "./worldTextures/srcContainer.jpg",

  "./worldTextures/back_image.png",
  "./worldTextures/left_image.png",
  "./worldTextures/front_image.png",
  
  "./worldTextures/srcContainer.jpg",
  "./worldTextures/bottom_image.png",
  "./worldTextures/srcContainer.jpg",
];



var imageURLsbo = [
  "./worldTextures/srcContainer.jpg",
  "./worldTextures/front_image.png",
  "./worldTextures/srcContainer.jpg",

  "./worldTextures/left_image.png",
  "./worldTextures/bottom_image.png",
  "./worldTextures/right_image.png",
  
  "./worldTextures/srcContainer.jpg",
  "./worldTextures/back_image.png",
  "./worldTextures/srcContainer.jpg",
];


var imageURLsba = [
  "./worldTextures/srcContainer.jpg",
  "./worldTextures/top_image.png",
  "./worldTextures/srcContainer.jpg",

  "./worldTextures/right_image.png",
  "./worldTextures/back_image.png",
  "./worldTextures/left_image.png",
  
  "./worldTextures/srcContainer.jpg",
  "./worldTextures/bottom_image.png",
  "./worldTextures/srcContainer.jpg",
];

const canvasUrlsf = await loadImagesToCanvases(imageURLsf);
const textureAtlasf = new TextureAtlas(canvasUrlsf,1400);
const canvasUrlst = await loadImagesToCanvasesTop(imageURLst);
const textureAtlast = new TextureAtlas(canvasUrlst,1400);
const canvasUrlsr = await  loadImagesToCanvasesRight(imageURLsr)
const textureAtlasr = new TextureAtlas(canvasUrlsr,1400);
const canvasUrlsl = await loadImagesToCanvasesLeft(imageURLsl)
const textureAtlasl = new TextureAtlas(canvasUrlsl,1400);
const canvasUrlsbo = await  loadImagesToCanvasesBottom(imageURLsbo)
const textureAtlasbo = new TextureAtlas(canvasUrlsbo,1400);
const canvasUrlsba = await  loadImagesToCanvasesBack(imageURLsba)
const textureAtlasba = new TextureAtlas(canvasUrlsba,1400);

const resf = await textureAtlasf.load()
const rest = await textureAtlast.load()
const resr = await textureAtlasr.load()
const resl = await textureAtlasl.load()
const resbo = await textureAtlasbo.load()
const resba = await textureAtlasba.load()


const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
canvas.width  = resba.canvas.width;
canvas.height = resba.canvas.height;
ctx.drawImage( resba.canvas, 0, 0);
viewGL.initPlanet([resf.canvas,rest.canvas,resr.canvas,resl.canvas,resbo.canvas,resba.canvas]);

/*
const textureAtlas = new TextureAtlas(canvasURLs,1400);

const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

textureAtlas.load().then(res=>{
  console.log(res)
  canvas.width  = res.canvas.width;
  canvas.height = res.canvas.height;
  ctx.drawImage( res.canvas, 0, 0);
  return res.canvas
  }).then(c=>{
    viewGL.initPlanet(c);

  })
*/

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
