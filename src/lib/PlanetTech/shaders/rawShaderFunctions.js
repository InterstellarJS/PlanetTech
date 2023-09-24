import * as THREE  from 'three'


    
  //https://github.com/ashima/webgl-noise/blob/master/src/noise3Dgrad.glsl
  export const snoise3D = 
    `
    vec3 mod289(vec3 x) {
        return x - floor(x * (1.0 / 289.0)) * 289.0;
      }

    vec4 mod289(vec4 x) {
        return x - floor(x * (1.0 / 289.0)) * 289.0;
      }
         

    vec4 permute(vec4 x) {
        return mod289(((x*34.0)+10.0)*x);
      }    

    vec4 taylorInvSqrt(vec4 r)
    {
    return 1.79284291400159 - 0.85373472095314 * r;
    }    

    vec4 snoise(vec3 v, vec3 gradient)
    {
    const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
    
    // First corner
    vec3 i  = floor(v + dot(v, C.yyy) );
    vec3 x0 =   v - i + dot(i, C.xxx) ;
    
    // Other corners
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min( g.xyz, l.zxy );
    vec3 i2 = max( g.xyz, l.zxy );
    
    //   x0 = x0 - 0.0 + 0.0 * C.xxx;
    //   x1 = x0 - i1  + 1.0 * C.xxx;
    //   x2 = x0 - i2  + 2.0 * C.xxx;
    //   x3 = x0 - 1.0 + 3.0 * C.xxx;
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
    vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y
    
    // Permutations
    i = mod289(i); 
    vec4 p = permute( permute( permute( 
            i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
          + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
          + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
    
    // Gradients: 7x7 points over a square, mapped onto an octahedron.
    // The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
    float n_ = 0.142857142857; // 1.0/7.0
    vec3  ns = n_ * D.wyz - D.xzx;
    
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)
    
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)
    
    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    
    vec4 b0 = vec4( x.xy, y.xy );
    vec4 b1 = vec4( x.zw, y.zw );
    
    //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;
    //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
    
    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);
    
    //Normalise gradients
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    
    // Mix final noise value
    vec4 m = max(0.5 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    vec4 m2 = m * m;
    vec4 m4 = m2 * m2;
    vec4 pdotx = vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3));
    
    // Determine noise gradient
    vec4 temp = m2 * m * pdotx;
    gradient = -8.0 * (temp.x * x0 + temp.y * x1 + temp.z * x2 + temp.w * x3);
    gradient += m4.x * p0 + m4.y * p1 + m4.z * p2 + m4.w * p3;
    gradient *= 105.0;
    
    float n = 105.0 * dot(m4, pdotx);
    return vec4(n,gradient);
    }
    `



  // Gradient noise courtesy of Inigo Quilez
  // https://iquilezles.org/articles/gradientnoise/
  export const valueNoise = `
  vec3 hash( vec3 p )      // this hash is not production ready, please
  {                        // replace this by something better
      p = vec3( dot(p,vec3(127.1,311.7, 74.7)),
        dot(p,vec3(269.5,183.3,246.1)),
        dot(p,vec3(113.5,271.9,124.6)));
  
      return -1.0 + 2.0*fract(sin(p)*43758.5453123);
  }
  
  // returns 3D value noise (in .x)  and its derivatives (in .yzw)
  vec4 noised( in vec3 x )
  {
    // grid
    vec3 i = floor(x);
    vec3 f = fract(x);
    
    // quintic interpolant
    vec3 u = f*f*f*(f*(f*6.0-15.0)+10.0);
    vec3 du = 30.0*f*f*(f*(f-2.0)+1.0);
    
    // gradients
    vec3 ga = hash( i+vec3(0.0,0.0,0.0) );
    vec3 gb = hash( i+vec3(1.0,0.0,0.0) );
    vec3 gc = hash( i+vec3(0.0,1.0,0.0) );
    vec3 gd = hash( i+vec3(1.0,1.0,0.0) );
    vec3 ge = hash( i+vec3(0.0,0.0,1.0) );
    vec3 gf = hash( i+vec3(1.0,0.0,1.0) );
    vec3 gg = hash( i+vec3(0.0,1.0,1.0) );
    vec3 gh = hash( i+vec3(1.0,1.0,1.0) );
    
    // projections
    float va = dot( ga, f-vec3(0.0,0.0,0.0) );
    float vb = dot( gb, f-vec3(1.0,0.0,0.0) );
    float vc = dot( gc, f-vec3(0.0,1.0,0.0) );
    float vd = dot( gd, f-vec3(1.0,1.0,0.0) );
    float ve = dot( ge, f-vec3(0.0,0.0,1.0) );
    float vf = dot( gf, f-vec3(1.0,0.0,1.0) );
    float vg = dot( gg, f-vec3(0.0,1.0,1.0) );
    float vh = dot( gh, f-vec3(1.0,1.0,1.0) );
  
    // interpolations
    return vec4( va + u.x*(vb-va) + u.y*(vc-va) + u.z*(ve-va) + u.x*u.y*(va-vb-vc+vd) + u.y*u.z*(va-vc-ve+vg) + u.z*u.x*(va-vb-ve+vf) + (-va+vb+vc-vd+ve-vf-vg+vh)*u.x*u.y*u.z,    // value
                  ga + u.x*(gb-ga) + u.y*(gc-ga) + u.z*(ge-ga) + u.x*u.y*(ga-gb-gc+gd) + u.y*u.z*(ga-gc-ge+gg) + u.z*u.x*(ga-gb-ge+gf) + (-ga+gb+gc-gd+ge-gf-gg+gh)*u.x*u.y*u.z +   // derivatives
                  du * (vec3(vb,vc,ve) - va + u.yzx*vec3(va-vb-vc+vd,va-vc-ve+vg,va-vb-ve+vf) + u.zxy*vec3(va-vb-ve+vf,va-vb-vc+vd,va-vc-ve+vg) + u.yzx*u.zxy*(-va+vb+vc-vd+ve-vf-vg+vh) ));
  }
  `;

  // Gradient noise courtesy of Inigo Quilez
  // https://iquilezles.org/articles/gradientnoise/
  export const valueNoisefbm = `
  vec4 valueNoisefbm(vec3 samplePos, float persistence, float lacunarity,int noiseOctaves) {
    vec4 accumulator = vec4(0, 0, 0, 0);
    float amplitude = 1.0;
    float frequency = 1.0;
    
    for (int i = 0; i < noiseOctaves; i++) {
        vec4 noise   = amplitude * noised(samplePos * frequency);
        noise.yzw   *= frequency;
        accumulator += noise;
        amplitude   *= persistence;
        frequency   *= lacunarity;
    }
    return accumulator;
  }
  `
  

  export const cellularNoisefbm = `
  vec4 cellularNoisefbm(vec3 samplePos, float persistence, float lacunarity,int noiseOctaves) {
    vec4 accumulator = vec4(0, 0, 0, 0);
    float amplitude = 1.0;
    float frequency = 1.0;
    
    for (int i = 0; i < noiseOctaves; i++) {
        vec4 noise   = amplitude * Cellular3D_Deriv(samplePos * frequency);
        noise.yzw   *= frequency;
        accumulator += noise;
        amplitude   *= persistence;
        frequency   *= lacunarity;
    }
    return accumulator;
  }
  `

  export const Hermite3D_Derivfbm = `
  vec4 Hermite3D_Derivfbm(vec3 samplePos, float persistence, float lacunarity,int noiseOctaves) {
    vec4 accumulator = vec4(0, 0, 0, 0);
    float amplitude = 1.0;
    float frequency = 1.0;
    
    for (int i = 0; i < noiseOctaves; i++) {
        vec4 noise   = amplitude * Hermite3D_Deriv(samplePos * frequency);
        noise.yzw   *= frequency;
        accumulator += noise;
        amplitude   *= persistence;
        frequency   *= lacunarity;
    }
    return accumulator;
  }
  `

  export const simplexNoisefbm = `
  vec4 simplexNoisefbm(vec3 samplePos, float persistence, float lacunarity,int noiseOctaves) {
    vec4 accumulator = vec4(0, 0, 0, 0);
    float amplitude = 1.0;
    float frequency = 1.0;
    
    for (int i = 0; i < noiseOctaves; i++) {
        vec4 noise   = amplitude * snoise(samplePos * frequency,vec3(0.));
        noise.yzw   *= frequency;
        accumulator += noise;
        amplitude   *= persistence;
        frequency   *= lacunarity;
    }
    return accumulator;
  }
  `

  export const basisFunctions = `
  void sphereBasis(in vec3 cubePosition, inout vec3 tangent, out vec3 normal) {
    float scale = dot(cubePosition, cubePosition);
    normal = cubePosition/sqrt(scale);
    tangent = normalize(tangent * scale - cubePosition * dot(tangent, cubePosition));    
  }`;
  


export const terrainFunctions = `

// Returns tangent space terrain normal in xyz and height in w.
vec4 genTerrain(vec3 cubePosition, bool worldSpace) {
  
  float heightScale = 0.1;

  vec3 tangent = modelMatrix[0].xyz;
  vec3 sphereNormal;
  sphereBasis(cubePosition, tangent, sphereNormal);
  
  samplePos = sphereNormal;
  vec4 noise;
  noise = combinedNoise();
  float height = noise.x ;
  vec3 gradient = noise.yzw;

  vec3 onSphere = gradient - dot(sphereNormal, gradient) * sphereNormal;
  vec3 terrainNormal = normalize(sphereNormal - onSphere * heightScale);

  if (worldSpace) {
    return vec4(terrainNormal, height);
  } else {
    vec3 bitangent = cross(sphereNormal, tangent);
    mat3 tbn = mat3(tangent, bitangent, sphereNormal);

    vec3 tspaceNormal = transpose(tbn) * terrainNormal;

    return vec4(tspaceNormal, height);
  }
}`


export const simplexPerlinNoiseFBm = `
  float simplexPerlinNoiseFBm(vec3 v_, float seed_, float scale_,float persistance_,float lacunarity_,float redistribution_,int octaves_, int iteration_,bool terbulance_, bool ridge_  ) {
    vec3 v = v_; 
    v += (seed_ * 100.0);
    float persistance = persistance_;
    float lacunarity = lacunarity_;
    float redistribution = redistribution_;
    int octaves = octaves_;
    bool terbulance = terbulance_;
    bool ridge = terbulance_ && ridge_;
  
    float result = 0.0;
    float amplitude = 1.0;
    float frequency = 1.0;
    float maximum = amplitude;
  
    for (int i = 0; i < iteration_; i++) {
      if (i >= octaves)
        break;
  
      vec3 p = v * frequency * scale_;
  
      float noiseVal = SimplexPerlin3D(p);
  
      if (terbulance)
        noiseVal = abs(noiseVal);
  
      if (ridge)
        noiseVal = -1.0 * noiseVal;
  
      result += noiseVal * amplitude;
  
      frequency *= lacunarity;
      amplitude *= persistance;
      maximum += amplitude;
    }
  
    float redistributed = pow(result, redistribution);
    return redistributed / maximum;
  }
  `