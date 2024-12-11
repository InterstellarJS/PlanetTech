import * as THREE  from 'three/tsl';

const createLocations = ( size, offset, axis ) => {
   const halfSize = Math.ceil(size/4)
   console.log(offset)
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
  const key = Math.ceil(size / 2);
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



export class QuadTreeNode extends THREE.Object3D{

  constructor(params, normalize){ 
    super(); 
    this.params = params
    this.neighbors = new Set()
    this._children = []

    let offset =  params.metaData.offset
    let matrixRotationData =  params.metaData.matrixRotationData
    let matrix  = matrixRotationData.propMehtod ? new THREE.Matrix4()[[matrixRotationData.propMehtod]](matrixRotationData.input) : new THREE.Matrix4() 
    matrix.premultiply(new THREE.Matrix4().makeTranslation(...offset));
     const b = new THREE.Box3(
    new THREE.Vector3(-params.size  , -params.size  , -params.size ),
    new THREE.Vector3(params.size  , params.size  , params.size  ));

    let center = new THREE.Vector3()
    b.getCenter(center)
    let _n = new THREE.Vector3()

    let normalizedCenter = center.clone()
    normalizedCenter.applyMatrix4(matrix)

    if(normalize){
      normalizedCenter.normalize()
      _n.copy(normalizedCenter)
      normalizedCenter.multiplyScalar(params.quadTreeController.config.radius)
      normalizedCenter.add(_n)
  }

    this.position.copy(normalizedCenter)
  }


  subdivide(node){
    const { metaData, size } = node.params;
    const  offset   = metaData.offset
    const { direction, matrixRotationData } = metaData;

    const axis = direction.includes('z') ? 'z' : direction.includes('x') ? 'x' : 'y';
    const locations = createLocations(size, offset, axis); 


    locations.forEach((location) => {
       

      let quadtreeNode = new QuadTreeNode( {size:Math.ceil(size/4), segments:100, metaData:{
        index:0,  
        offset:location,  
        direction,
        matrixRotationData}, quadTreeController:{config:{radius:15}}}, true)
        node.add(quadtreeNode)
        node._children.push(quadtreeNode)

        const geometry = new THREE.SphereGeometry( 0.1, 32, 16 ); 
        const material = new THREE.MeshStandardMaterial( { color: 'red' } ); 
        const sphere   = new THREE.Mesh( geometry, material ); 
        sphere.position.copy(quadtreeNode.position)
        node.attach(sphere)
    });

  

  }

  insert(OBJECT3D,primative,node) {

    let localToWorld = primative.localToWorld(new THREE.Vector3().copy(node.position)) 
    var distance = localToWorld.distanceTo(OBJECT3D.position)
     console.log('=========',primative.quadTreeController.config.minLevelSize)
 

     if ( (distance) < (primative.quadTreeController.config.lodDistanceOffset * node.params.size) && node.params.size > primative.quadTreeController.config.minLevelSize ){

      console.log('YOOOOOOOO')
      console.log(node.params.metaData.direction)
      console.log(node.params.metaData.index)
      console.log(node.params.metaData.offset)
      console.log('----------')


      if (node._children.length === 0) {
        node.subdivide(node);
      }
console.log(node._children)


for (const child of node._children) { child.insert(OBJECT3D,primative,child); } 
     }
     return

  }
 
  }




export class QuadTree {

  constructor(){
    this.rootNodes  = []
  } 


  update(OBJECT3D,primative,node){
    node.insert(OBJECT3D)
  }

  insert(OBJECT3D,primative,node){
     
  }

  split(OBJECT3D,primative,node){
    
    }
  }