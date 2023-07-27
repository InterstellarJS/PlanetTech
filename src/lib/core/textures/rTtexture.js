import * as THREE from 'three';
import * as NODE from 'three/nodes';

function scaleTo100(number) {
  return 100 * (1 / number);
}

export class RtTexture {
  constructor(resoultion=512) {
    this.rtWidth  = resoultion;
    this.rtHeight = resoultion;
  }

 initRenderTraget(){
    this. rtScene       = new THREE.Scene();
    this. rtScene.background  = new THREE.Color('pink');
    this. rtCamera      = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this. renderTarget  = new THREE.WebGLRenderTarget(this.rtWidth, this.rtHeight);
  }

  initRenderTragetCubeMap(){
    var width = 6
    var height = 6
    this. rtScene       = new THREE.Scene();
    this. rtScene.background  = new THREE.Color('blue');
    this. rtCamera      = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, 1, 1000 );
    this. renderTarget  = new THREE.WebGLRenderTarget(this.rtWidth, this.rtHeight);
  }

  toMesh(w,h,wr,hs){
    const geometry = new THREE.PlaneGeometry( w,h,wr,hs);
    const material = new NODE.MeshBasicNodeMaterial();
    const plane = new THREE.Mesh( geometry, material );
    return plane

  }

  toPlaneMesh(w,h,wr,hs){
    const geometry = new THREE.PlaneGeometry( w,h,wr,hs);
    const material = new NODE.MeshBasicNodeMaterial();
    const plane = new THREE.Mesh( geometry, material );
    return plane
    
  }

  getTexture(){
    var t = this.renderTarget.texture
    return t
  }

  add(mesh){
    var s = scaleTo100(mesh.geometry.parameters.width)
    this.rtCamera.position.set(mesh.position.x, mesh.position.y, mesh.position.z);
    this.rtCamera.position.z += 65
    this.rtScene.add(mesh)
    mesh.scale.set(s,s,s)
  }

  snapShot(rend){
    rend.renderer.setRenderTarget(this.renderTarget);
    rend.renderer.clear();
    rend.renderer.render(this.rtScene, this.rtCamera);
    rend.renderer.setRenderTarget(null);
  }

  getPixels(rend){
    var pixels = new Uint8Array(this.rtWidth * this.rtHeight * 4);
    rend.renderer.readRenderTargetPixels(this.renderTarget, 0, 0, this.rtWidth, this.rtHeight, pixels);
    return pixels
  }

  toImage(pixels){
    // Create a canvas element
    var canvas    = document.createElement('canvas');
    canvas.width  = this.rtWidth;
    canvas.height = this.rtHeight;
    // Get the pixel data from the render target and put it on the canvas
    var context   = canvas.getContext('2d');
    context.imageSmoothingEnabled = false;

    canvas.style.imageRendering = "crisp-edges";
    canvas.style.imageRendering = "-moz-crisp-edges";
    canvas.style.imageRendering = "pixelated";
    canvas.style.imageRendering = "-webkit-crisp-edges";

    var imageData = context.createImageData(this.rtWidth, this.rtHeight);
    imageData.data.set(pixels);
    // Flip the image vertically
    var tmpCanvas    = document.createElement('canvas');
    tmpCanvas.width  = this.rtWidth;
    tmpCanvas.height = this.rtHeight;
    tmpCanvas.imageSmoothingEnabled = false;

    tmpCanvas.style.imageRendering = "crisp-edges";
    tmpCanvas.style.imageRendering = "-moz-crisp-edges";
    tmpCanvas.style.imageRendering = "pixelated";
    tmpCanvas.style.imageRendering = "-webkit-crisp-edges";

    var tmpContext   = tmpCanvas.getContext('2d');


    tmpContext.putImageData(imageData, 0, 0);
    context.translate(0, this.rtHeight);
    context.scale(1, -1);
    context.drawImage(tmpCanvas, 0, 0);
    return canvas
  }


   height2normal( canvas ) {

    var context = canvas.getContext( '2d' );

    var width = canvas.width;
    var height = canvas.height;

    var src = context.getImageData( 0, 0, width, height );
    var dst = context.createImageData( width, height );

    for ( var i = 0, l = width * height * 4; i < l; i += 4 ) {

      var x1, x2, y1, y2;

      if ( i % ( width * 4 ) == 0 ) {

        // left edge

        x1 = src.data[ i ];
        x2 = src.data[ i + 4 ];

      } else if ( i % ( width * 4 ) == ( width - 1 ) * 4 ) {

        // right edge

        x1 = src.data[ i - 4 ];
        x2 = src.data[ i ];

      } else {

        x1 = src.data[ i - 4 ];
        x2 = src.data[ i + 4 ];

      }

      if ( i < width * 4 ) {

        // top edge

        y1 = src.data[ i ];
        y2 = src.data[ i + width * 4 ];

      } else if ( i > width * ( height - 1 ) * 4) {

        // bottom edge

        y1 = src.data[ i - width * 4 ];
        y2 = src.data[ i ];

      } else {

        y1 = src.data[ i - width * 4 ];
        y2 = src.data[ i + width * 4 ];

      }

      dst.data[ i ] = ( x1 - x2 ) + 127;
      dst.data[ i + 1 ] = ( y1 - y2 ) + 127;
      dst.data[ i + 2 ] = 255;
      dst.data[ i + 3 ] = 255;


    }

    context.putImageData( dst, 0, 0 );
    return canvas
  }


  height2normalv2(canvasInput){
		var canvasOutput = document.createElement('canvas'); // Setup output canvas, context & dimensions...
    var ctx_i = canvasInput.getContext('2d');
    var ctx_o = canvasOutput.getContext('2d');
    var w = canvasInput.width - 1;
    var h = canvasInput.height - 1;
    var pixel, x_vector, y_vector;
    canvasOutput.width = w + 1;
		canvasOutput.height = h + 1;
    for (var y = 0; y < h + 1; y += 1) {
      for (var x = 0; x < w + 1; x += 1) {
        var data = [0, 0, 0, 0, x > 0, x < w, y > 0, y < h, x - 1, x + 1, x, x, y, y, y - 1, y + 1];
        for (var z = 0; z < 4; z += 1) {
          if (data[z + 4]) {
            pixel = ctx_i.getImageData(data[z + 8], data[z + 12], 1, 1);
            data[z] = ((0.299 * (pixel.data[0] / 255) * 1.5) + (0.587 * (pixel.data[1] / 255) * 1.5) + (0.114 * (pixel.data[2] / 255))) / 3;
          } else {
            pixel = ctx_i.getImageData(x, y, 1, 1);
            data[z] = ((0.299 * (pixel.data[0] / 255) * 1.5) + (0.587 * (pixel.data[1] / 255) * 1.5) + (0.114 * (pixel.data[2] / 255))) / 3;
          }
        }
        x_vector = parseFloat((Math.abs(data[0] - data[1]) + 1) * 0.5) * 255;
        y_vector = parseFloat((Math.abs(data[2] - data[3]) + 1) * 0.5) * 255;
        ctx_o.fillStyle = "rgba(" + x_vector + "," + y_vector + ",255,255)";
        ctx_o.fillRect(x, y, 1, 1);
      }
    }
    return canvasOutput
  }


  download(canvas,c=0){
    // Download the canvas as an image
    var downloadLink = document.createElement('a');
    downloadLink.href = canvas.toDataURL('image/png');
    downloadLink.download = `${c}_image.png`;
    downloadLink.click();
  }

  downloadImages(instances,rend){
    this.initRenderTraget()
    for (let index = 0; index < instances.length; index++) {
      let element = instances[index];
      this.add(element)
      this.snapShot(rend)
      this.download(this.toImage(this.getPixels(rend)),index)
    }
  }

}



/*

this.rtt = new RtTexture()
this.rtt.initRenderTraget()
this.rtt.add(this.quad.instances[28].plane)
this.rtt.snapShot(this.rend)
var plane = this.rtt.toMesh(50000, 50000,50,50)
plane.position.z = 500000
this.rend.scene.add(plane)
var pixels = this.rtt.getPixels(this.rend)
var img = this.rtt.toImage(pixels)
//this.rtt.download(img)

*/