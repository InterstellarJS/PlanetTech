import * as THREE  from 'three';

class TextureAtlas {
  constructor(imagePaths, squareSize = 1400 ) {
    this.imagePaths = imagePaths;
    this.squareSize = squareSize;
  }

  load(index = [], scale) {
    return new Promise((resolve, reject) => {
      const numImages = this.imagePaths.length;
      const atlasSize = Math.ceil(Math.sqrt(numImages)) * this.squareSize;
      var positionsScale = [];
      const numRows      = Math.ceil(Math.sqrt(numImages));
      const numCols      = Math.ceil(Math.sqrt(numImages));
      const scales       = (1 / numRows)
      // remove dead positions
      var c = 0
      for (var i = numCols-1; i >= 0; i--) {
        for (var j = 0; j < numRows; j++) {
        if (c<numImages) {
          positionsScale.push(new THREE.Vector3(j, i, scales));
        } else {
          //pass
        }
        c++
        }
      }

      const imagePromises = this.imagePaths.map((path, i) => {
        return new Promise((resolve, reject) => {
          const img  = new Image();
          img.src    = path;
          img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = this.squareSize;
            canvas.height = this.squareSize;
            const ctx = canvas.getContext("2d");
            const squareImgSize = Math.min(img.width, img.height);
            let imgScale = this.squareSize / squareImgSize;
            if (i === index[i]) {
              imgScale = scale;
            }
            const imgWidth = squareImgSize * imgScale;
            const imgHeight = squareImgSize * imgScale;
            ctx.drawImage(
              img,
              (this.squareSize - imgWidth) / 2,
              (this.squareSize - imgHeight) / 2,
              imgWidth,
              imgHeight
            );
            //squareFallOff(ctx, 880,680, 'black');// TODO:
            //squareFallOff(ctx, 880, 580, 30, 'black')
            resolve(canvas);
          };

          img.onerror = () => {
            reject(new Error(`Failed to load image: ${path}`));
          };
        });
      });

      Promise.all(imagePromises)
        .then(imageCanvases => {
          const canvas  = document.createElement("canvas");
          canvas.width  = atlasSize;
          canvas.height = atlasSize;
          const ctx     = canvas.getContext("2d");
          let currentX  = 0;
          let currentY  = 0;
          imageCanvases.forEach((imageCanvas, i) => {
            ctx.drawImage(imageCanvas, currentX, currentY);
            currentX     += this.squareSize;
            if (currentX >= atlasSize) {
              currentX    = 0;
              currentY   += this.squareSize;
            }
          });
          resolve({canvas:canvas,positionsScale:positionsScale});
        })
        .catch(error => {
          reject(error);
        });
    });
  }
}


export default TextureAtlas