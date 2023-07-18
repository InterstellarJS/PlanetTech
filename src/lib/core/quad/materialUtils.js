import * as THREEWG from 'three/nodes';
import * as THREE   from 'three';


var displace = THREEWG.func( `
  fn d( tex: texture_2d<f32>, tex_sampler: sampler, uv:vec2<f32>)-> f32 {
    return textureSample( tex, tex_sampler, uv ).r;
  }
` );

var orthogonal = THREEWG.func( `
  fn orthogonal(v:vec3<f32>)-> vec3<f32>{
    return normalize(select(vec3(0.0, -v.z, v.y), vec3(-v.y, v.x, 0.0), abs(v.x) > abs(v.z)));
  }
` );


var MOD289_3 = THREEWG.func(
`
fn mod289_3(x: vec3<f32>) -> vec3<f32> {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
  }
`)

var MOD289_4 = THREEWG.func(
`
fn mod289_4(x: vec4<f32>) -> vec4<f32> {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
  }
`)


var PERMUTE_4 = THREEWG.func(
`
fn permute_4(x: vec4<f32>) -> vec4<f32> {
    return mod289_4(((x * 34.0) + 10.0) * x);
  }
`,[MOD289_4])


var TAYLOR_INV_SQRT_4 = THREEWG.func(
`
fn taylorInvSqrt_4(r: vec4<f32>) -> vec4<f32> {
    return 1.79284291400159 - 0.85373472095314 * r;
    }
`)

var snoise_ = THREEWG.func(
  `fn snoise3d(v: vec3<f32>) -> f32 {
    let C = vec2<f32>(1.0 / 6.0, 1.0 / 3.0) ;
    let D = vec4<f32>(0.0, 0.5, 1.0, 2.0);
  
    // First corner
    var i = floor(v + dot(v, C.yyy));
    let x0 = v - i + dot(i, C.xxx);
  
    // Other corners
    let g = step(x0.yzx, x0.xyz);
    let l = 1.0 - g;
    let i1 = min( g.xyz, l.zxy );
    let i2 = max( g.xyz, l.zxy );
  
    //   x0 = x0 - 0.0 + 0.0 * C.xxx;
    //   x1 = x0 - i1  + 1.0 * C.xxx;
    //   x2 = x0 - i2  + 2.0 * C.xxx;
    //   x3 = x0 - 1.0 + 3.0 * C.xxx;
    let x1 = x0 - i1 + C.xxx;
    let x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
    let x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y
  
    // Permutations
    i = mod289_3(i);
    let p = permute_4(
      permute_4(
        permute_4(i.z + vec4<f32>(0.0, i1.z, i2.z, 1.0)) + i.y + vec4<f32>(0.0, i1.y, i2.y, 1.0)
      ) + i.x + vec4<f32>(0.0, i1.x, i2.x, 1.0)
    );
  
    // Gradients: 7x7 points over a square, mapped onto an octahedron.
    // The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
    let n_ = 0.142857142857; // 1.0/7.0
    let  ns = n_ * D.wyz - D.xzx;
  
    let j = p - 49.0 * floor(p * ns.z * ns.z); // mod(p, 7 * 7)
  
    let x_ = floor(j * ns.z);
    let y_ = floor(j - 7.0 * x_); // mod(j, N)
  
    let x = x_ * ns.x + ns.yyyy;
    let y = y_ * ns.x + ns.yyyy;
    let h = 1.0 - abs(x) - abs(y);
  
    let b0 = vec4<f32>(x.xy, y.xy);
    let b1 = vec4<f32>(x.zw, y.zw);
  
    // let s0 = vec4<f32>(lessThan(b0,0.0))*2.0 - 1.0;
    // let s1 = vec4<f32>(lessThan(b1,0.0))*2.0 - 1.0;
    let s0 = floor(b0) * 2.0 + 1.0;
    let s1 = floor(b1) * 2.0 + 1.0;
    let sh = -step(h, vec4<f32>(0.0));
  
    let a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    let a1 = b1.xzyw + s1.xzyw*sh.zzww;
  
    var p0 = vec3<f32>(a0.xy, h.x);
    var p1 = vec3<f32>(a0.zw, h.y);
    var p2 = vec3<f32>(a1.xy, h.z);
    var p3 = vec3<f32>(a1.zw, h.w);
  
    // Normalise gradients
    let norm = taylorInvSqrt_4(vec4<f32>(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 = p0 * norm.x;
    p1 = p1 * norm.y;
    p2 = p2 * norm.z;
    p3 = p3 * norm.w;
  
    // Mix final noise value
    var m = max(0.6 - vec4<f32>(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), vec4<f32>(0.0));
    m = m * m;
  
    return 42.0 * dot(
      m * m,
      vec4<f32>(dot(p0, x0), dot(p1,x1), dot(p2,x2), dot(p3,x3))
    );
  }
`,[
    MOD289_3,
    MOD289_4,
    PERMUTE_4,
    TAYLOR_INV_SQRT_4
]
)

/*

  struct gln_tFBMOpts {
    float seed;
    int iter;
    float scale;
    float persistance;
    float lacunarity;
    float redistribution;
    int octaves;
    bool terbulance;
    bool ridge;
  };

  gln_tFBMOpts opts01 = gln_tFBMOpts(2.0, 5, 0.5, 2.0, 0.5, 1.0, 2, true, true);
*/

export const snoise3dfbm_ = THREEWG.func(`
fn snoise3dfbm_(v_: vec3<f32>, seed_:f32, iteration_:i32, scale_:f32, persistance_:f32, lacunarity_:f32, redistribution_:f32, octaves_:i32, terbulance_:bool, ridge_:bool) -> f32 {
    var v = v_;
    v += (seed_ * 100.0);
    var iter : i32           = iteration_;
    var scale  : f32         = scale_;
    var persistance : f32    = persistance_;
    var lacunarity : f32     = lacunarity_;
    var redistribution : f32 = redistribution_;
    var octaves : i32        = octaves_;
    var terbulance  : bool   = terbulance_;
    var ridge  : bool        = terbulance && ridge_;

    var result = 0.0;
    var amplitude = 1.0;
    var frequency = 1.0;
    var maximum = amplitude;
  
    for (var i = 0; i < iter; i++) {
      if (i >= octaves){
        break;
      }
  
      var p = v * frequency * scale;
  
      var noiseVal = snoise3d(p);
  
      if (terbulance){
        noiseVal = abs(noiseVal);
      }
  
      if (ridge){
        noiseVal = -1.0 * noiseVal;
      }
  
      result += noiseVal * amplitude;
  
      frequency *= lacunarity;
      amplitude *= persistance;
      maximum += amplitude;
    }
  
    var redistributed = pow(result, redistribution);
    return redistributed / maximum;
}
`,[snoise_])



export const pattern = THREEWG.func(`
fn pattern(p:vec3<f32>)-> f32 {
    let q = vec3(   snoise3dfbm_(p + vec3(8.0, 3.0, 4.0),2.0, 5, .05, 2.0, 0.5, 1.0, 2, true, true),
                    snoise3dfbm_(p + vec3(5.2, 1.3, 1.2),1.0, 5, .3, 2.0, 0.5, 1.0, 8, true, true),
                    snoise3dfbm_(p + vec3(1.7, 9.2, 0.5),5.0, 5, .3, 2.0, 0.5, 1.0, 12, true, true));
    

    let r = vec3(snoise3dfbm_(p + 4.0 * q + vec3(2.0, 9.0, 1.7),7.0, 5, 6.3, 2.0, 0.5, 1.0, 5, true, false),
                snoise3dfbm_(p + 4.0 * q + vec3(8.3, 2.8, 2.0),2.0, 1, .3, 2.0, 0.5, 2.5, 7, false, false),
                snoise3dfbm_(p + 4.0 * q + vec3(1.2, 3.4, 0.6),6.0, 5, 0.5, 2.0, 0.5, 2.0, 4, true, false));
      return    snoise3dfbm_(p + 4.0 * r,5.0, 1, 0.5, .05, 0.5, 1.0, 7, false, true);
}
`,[snoise3dfbm_])




export const displacedNormalWSL = THREEWG.func(`
fn displacedNormal(
    wp:vec3<f32>,
    vn:vec3<f32>
    )-> vec3<f32> {
      let displacedPosition = wp + vn * snoise3dfbm_(wp,1.0, 5, 5.3, 2.0, 0.5, 1.0, 8, false, false);
      let offset : f32 = ${100 / 550};
      let tangent = orthogonal(vn);
      let bitangent = normalize(cross(vn, tangent));
      let neighbour1 = wp + tangent * offset;
      let neighbour2 = wp + bitangent * offset;
      let displacedNeighbour1 = neighbour1 + vn * snoise3dfbm_(neighbour1,1.0, 5, 5.3, 2.0, 0.5, 1.0, 8, false, false);
      let displacedNeighbour2 = neighbour2 + vn * snoise3dfbm_(neighbour2,1.0, 5, 5.3, 2.0, 0.5, 1.0, 8, false, false);
      let displacedTangent = displacedNeighbour1 - displacedPosition;
      let displacedBitangent = displacedNeighbour2 - displacedPosition;
      let displacedNormal = normalize(cross(displacedTangent, displacedBitangent));
      return displacedNormal*.5+.5;  
}
`,[orthogonal,snoise3dfbm_,pattern])


export const lightingWSL = THREEWG.func(`
fn lightWSL(displacedNormal:vec3<f32>,ld:vec3<f32>)-> vec3<f32> {
    let  lightAmbient : f32 = 0.65;
    let  lightDiffuse : f32 = 0.9;
    let  n =  displacedNormal;
    let  lightDir  = ld;
    let  nn = normalize(n);
    let  diffuse  = max(dot(nn, lightDir), 0.0);
    let  grey   = 0.1 * n.r + 0.5 * n.g + 0.5 * n.b;
    let  coloru = (lightAmbient + lightDiffuse * diffuse) * grey ;
    return vec3(coloru,coloru,coloru);
}
`)
