export function displayCanvasesInGrid(canvasArray,  gridSize) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const imageSize = canvasArray[0].width; // Assuming all canvases have the same size

    canvas.width = Math.ceil(canvasArray.length / gridSize) * imageSize;
    canvas.height = gridSize * imageSize;

    for (let i = 0; i < canvasArray.length; i++) {
        const row = i % gridSize;
        const col = Math.floor(i / gridSize);
        const x = col * imageSize;
        const y = row * imageSize;

        ctx.drawImage(canvasArray[i], x, y);
    }
    return canvas
}


export function downloadFile(data, filename_=`0`) {
    let filename = `${filename_}_exported.obj`
    const blob = new Blob([data], { type: 'text/plain' });
  
    // Create a temporary link element
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
  
    // Append the link to the body and click it
    document.body.appendChild(link);
    link.click();
  
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }
  