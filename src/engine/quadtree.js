import * as THREE  from 'three/tsl';

export  class QuadTreeLoDCore  {
  constructor(config={}) {
    let shardedData = {
      maxLevelSize:1,
      minLevelSize:1,
      minPolyCount:1,
      maxPolyCount:undefined,
      dimensions:1,
      arrybuffers:{},
      shardedUniforms:{}, // TODO:
      dataTransfer:{
        front:  {textuers:[]},
        back:   {textuers:[]},
        right:  {textuers:[]},
        left:   {textuers:[]},
        top:    {textuers:[]},
        bottom: {textuers:[]},
      },
      position:{x:0,y:0,z:0},
      scale: 1,
      color: THREE.vec3(0,0,0),
      light:{},
      lodDistanceOffset: 1,
      material: new THREE.MeshBasicNodeMaterial({color:"grey"}),
      displacmentScale:1
    }
    this.config = Object.assign(shardedData, config)
  }

  levels(numOflvls) {
    var levelsArray  = [];
    var polyPerLevel = [];
    var value        = this.config.maxLevelSize
    var min          = this.config.minLevelSize
    var minPoly      = this.config.minPolyCount
    for (let i = 0; i < numOflvls; i++) {
        levelsArray .push( value   )
        polyPerLevel.push( minPoly )
        value   = Math.floor( value / 2   )
        minPoly = Math.floor( minPoly * 2 )
    }
    this.config['levels'] = {numOflvls,levelsArray,polyPerLevel}
    this.config['maxPolyCount'] = polyPerLevel[polyPerLevel.length - 1]
  }

  createArrayBuffers(){
    for ( var i = 0; i < this.config.levels.numOflvls;  i++ ) {
      const size     = this.config.levels.levelsArray [i]
      const poly     = this.config.levels.polyPerLevel[i]
      const geometry = new THREE.PlaneGeometry(size,size,poly,poly)
      this.config.arrybuffers[size] = {
        geometry:{
          parameters:         geometry.parameters,
          stringUv:           geometry.attributes.uv.array.toString(),
          stringPosition:     geometry.attributes.position.array.toString(),
          stringNormal:       geometry.attributes.normal  .array.toString(),
          byteLengthNormal:   geometry.attributes.position.array.byteLength,
          byteLengthPosition: geometry.attributes.position.array.byteLength,
        },
        idx:Array.from(geometry.index.array)
      }
    }
  }



  static deleteShardedData() {
    const shardedDataKeys = Object.keys(QuadTreeLoDCore.shardedData);
    for (let i = 0; i < shardedDataKeys.length; i++) {
      delete QuadTreeLoDCore.shardedData[shardedDataKeys[i]];
    }
  }
}



