import * as THREE  from 'three/tsl';

const createLocations = ( size, offset, axis ) => {
   const halfSize = size / 4;
  switch (axis) {
    case 'z':
      return [
        [ halfSize + offset[0],  halfSize + offset[1], offset[2]],
        [-halfSize + offset[0],  halfSize + offset[1], offset[2]],
        [ halfSize + offset[0], -halfSize + offset[1], offset[2]],
        [-halfSize + offset[0], -halfSize + offset[1], offset[2]],
      ];
    case 'x':
      return [
        [offset[0],  halfSize + offset[1],  halfSize + offset[2]],
        [offset[0],  halfSize + offset[1], -halfSize + offset[2]],
        [offset[0], -halfSize + offset[1],  halfSize + offset[2]],
        [offset[0], -halfSize + offset[1], -halfSize + offset[2]],
      ];
    case 'y':
      return [
        [ halfSize + offset[0], offset[1],  halfSize + offset[2]],
        [-halfSize + offset[0], offset[1],  halfSize + offset[2]],
        [ halfSize + offset[0], offset[1], -halfSize + offset[2]],
        [-halfSize + offset[0], offset[1], -halfSize + offset[2]],
      ];
    default:
      return [];
  }
};

const createNode = (primitive, parent, callBack, params) => {
  const { shardedData, direction, matrixRotationData, location } = params;

  primitive.createNewNode({
    shardedData,
    direction,
    matrixRotationData,
    offset: location,
    index: null,
    callBack,
    parent,
  });
};

const handleDirection = (primitive, parent, direction, size, offset, shardedData, matrixRotationData, callBack) => {
  const axis = direction.includes('z') ? 'z' : direction.includes('x') ? 'x' : 'y';
  const locations = createLocations(size, offset, axis);

  locations.forEach((location) => {
    createNode(primitive, parent, callBack, { shardedData, direction, matrixRotationData, location });
  });

  parent.plane().material.visible = false;
};

const setChildren = (primitive, node) => {
  const { metaData, size } = node.params;
  const  offset   = metaData.offset
  const { direction, matrixRotationData } = metaData;
  const key = size / 2;
  const shardedData = primitive.quadTreeController.config.arrybuffers[key];

  const callBack = (_node) => {
    _node.plane().material = new THREE.MeshStandardNodeMaterial({
      color: new THREE.Color(Math.random(), Math.random(), Math.random()),
    });
    _node.plane().occlusionTest = true;
  }

  handleDirection(primitive, node, direction, size, offset, shardedData, matrixRotationData, callBack);
};




export class QuadTreeController {

  constructor(config = {}) {
    let shardedData = {
      maxLevelSize:1,
      minLevelSize:1,
      minPolyCount:1,
      maxPolyCount:undefined,
      dimensions:1,
      arrybuffers:{},
      scale: 1,
      lodDistanceOffset: 1,
      displacmentScale:1,
      material: new THREE.MeshBasicNodeMaterial({ color: "grey" }),
    }
    this.config = Object.assign( shardedData, config )
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
      const size  = this.config.levels.levelsArray [i]
      const poly  = this.config.levels.polyPerLevel[i]
      this.config.arrybuffers[size] = {
        geometryData:{
          parameters: {
            width: size,
            height:size,
            widthSegments: poly,
            heightSegments:poly
          },
          byteLengthUv:       (poly+1) * (poly+1) * 2 * 4,
          byteLengthPosition: (poly+1) * (poly+1) * 3 * 4,
          byteLengthNormal:   (poly+1) * (poly+1) * 3 * 4,
          byteLengthIndex:    poly * poly * 6 * 4,
        }
      }
    }
  }

}


export class QuadTree {

  constructor(){} 

  insert(primative,node){
    this.split(primative,node)
  }

  split(primative,node){
    setChildren ( primative, node )
   
    }
  }


  export class QuadTreeNode extends THREE.Object3D{ 

    constructor(params){ 
      super(); 
      this.params = params
      this.neighbors = new Set()
    }
    
    plane(){
      if (this.children[0] instanceof THREE.Mesh) // just to make sure
        return this.children[0]
    }
    
  }