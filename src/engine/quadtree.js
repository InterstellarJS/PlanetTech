import * as THREE  from 'three/tsl';
import { MeshNode } from './nodes.js';
import { generateKey } from './utils.js'

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
      material: new THREE.MeshBasicMaterial({ color: "grey" }),
      callBacks:{
        onMeshCreation: node => undefined,
        onQuadTreeNodeCreation: node => undefined
      }
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
        value   = ( value / 2   )
        minPoly = ( minPoly * 2 )
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


const quadTreeUpdate = async (OBJECT3D, primitive, quadtreeNode, visibleMeshNodes ) => {
  quadtreeNode.insert(OBJECT3D, primitive);
  const visibleNodes = quadtreeNode.visibleNodes(OBJECT3D, primitive);

  for (const node of visibleNodes) {
    const key = generateKey(node);

    if (primitive.nodes.has(key)) {
      const meshNode = primitive.threaded
        ? await primitive.nodes.get(key)
        : primitive.nodes.get(key);

      meshNode.showMesh();
      visibleMeshNodes.add(key);
    } else {
      const { size, segments, offset, matrixRotationData } = node.params;
      const shardedData = primitive.quadTreeController.config.arrybuffers[size];
      const material = primitive.quadTreeController.config.material;

      let meshNode = new MeshNode(node.params, 'active');
      meshNode = primitive.createPlane({
        material,
        size,
        resolution: segments,
        matrixRotationData,
        offset,
        shardedData,
        node: meshNode,
        parent: primitive,
      });

      primitive.addNode(key, meshNode);
      visibleMeshNodes.add(key);
    }
  }
};


export class QuadTree {
  constructor() {
    this.rootNodes = [];
  }

  async update(OBJECT3D, primitive) {
    const visibleMeshNodes = new Set();

    if (primitive.threaded) {
      await Promise.all(
        this.rootNodes.map((quadtreeNode) =>
          quadTreeUpdate(OBJECT3D, primitive, quadtreeNode, visibleMeshNodes)
        )
      );

      for (const [key, value] of primitive.nodes.entries()) {
        if (!visibleMeshNodes.has(key)) {
          const meshNode = await value;
          meshNode.hideMesh();
        }
      }
    } else {
      this.rootNodes.forEach((quadtreeNode) => {
        quadTreeUpdate(OBJECT3D, primitive, quadtreeNode, visibleMeshNodes);
      });

      for (const [key, meshNode] of primitive.nodes.entries()) {
        if (!visibleMeshNodes.has(key)) {
          meshNode.hideMesh();
        }
      }
    }
  }
}