export function getRandomColor() {
    /*
    this function is use to create a random color for better visualization
    */
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
    }
  
  export function hexToRgbA(hex){
      var c;
      if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
          c= hex.substring(1).split('');
          if(c.length== 3){
              c= [c[0], c[0], c[1], c[1], c[2], c[2]];
          }
          c= '0x'+c.join('');
          return [((c>>16)&255)/100, ((c>>8)&255)/100, (c&255)/100].map(x=> x.toFixed(5))
      }
      throw new Error('Bad Hex');
  }
  
  export function norm(val, max, min) { return (val - min) / (max - min); }
  
  export function levelColor(levels){
    var colorArray = []
    for (var i = 0; i < levels; i++) {
      colorArray.push(hexToRgbA(getRandomColor()))
    }
    return colorArray
  }
  