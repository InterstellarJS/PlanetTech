import * as NODE from 'three/nodes';


const  mod289_vec3 = NODE.func(
`
vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}
    `)


    
const mod289_vec4 = NODE.func(
`
vec4 mod289(vec4 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}
    `)


const permute = NODE.func(
`
vec4 permute(vec4 x) {
  return mod289(((x*34.0)+10.0)*x);
}    `,[mod289_vec3,mod289_vec4])



const taylorInvSqrt = NODE.func(
`
vec4 taylorInvSqrt(vec4 r)
{
return 1.79284291400159 - 0.85373472095314 * r;
}    `)

export const snoise = NODE.func(`
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
`,[mod289_vec3,mod289_vec4,permute,taylorInvSqrt]
)   


export const lightv2 = NODE.func(`
float lightv2(vec4 normalMap, vec3 lightPosition, vec3 cP) {

vec3 lightDirection = normalize(lightPosition - normalMap.xyz);
vec3 viewDirection = normalize(cP - normalMap.xyz);
vec3 ambientColor = vec3(0.2, 0.2, 0.2);  // Ambient light color
vec3 diffuseColor = vec3(0.2, 0.2, 0.2);  // Diffuse light color
vec3 specularColor = vec3(0.2, 0.2, 0.2); // Specular light color
float shininess = 0.0;  // Material shininess factor

// Ambient lighting calculation
vec3 ambient = ambientColor;

// Diffuse lighting calculation
float diffuseIntensity = max(dot(normalMap.xyz, lightDirection), 0.0);
vec3 diffuse = diffuseColor * diffuseIntensity;

// Specular lighting calculation
vec3 reflectionDirection = reflect(-lightDirection, normalMap.xyz);
float specularIntensity = pow(max(dot(reflectionDirection, viewDirection), 0.0), shininess);
vec3 specular = specularColor * specularIntensity;

// Final lighting calculation
vec3 finalColor = ambient + diffuse + specular;
return clamp(dot(normalMap.xyz, lightDirection), 0.0, 1.0) * max(max(finalColor.r, finalColor.g), finalColor.b);
}
`)


export const normals = NODE.func(`
vec3 normals(vec3 grad,vec3 sampleDir){
// IQ's version returns noise value in x, gradient in yzw.
vec3 gradient = grad;
// Zero out component perpendicular to the sphere.
vec3 onSphere = gradient - dot(sampleDir, gradient) * sampleDir;
// Normal vector tilts away from "uphill" direction.
vec3 normal = normalize(sampleDir - onSphere * .1);
return normal;
}

`)


export const tangentSpace = NODE.func(`
vec3 tangentSpace(vec4 tangent,vec3 norma, vec3 nmap){
vec3 _tangent = tangent.xyz;
vec3 bitangent = normalize(cross(_tangent,norma));
mat3 TBN = mat3(_tangent,bitangent,(norma));
return (TBN*nmap); 
}
`)


export const sdfbm = NODE.func(`
vec4 fbmd(  vec3 x, int octaves, bool t){

	bool terbulance = t;
  bool ridg = t && true;
  const float scale  = 1.5;

  float a = 0.0;
  float b = 0.5;
  float f = 1.0;
  vec3  d = vec3(0.0);
 
    for( int i=0; i<octaves; i++ )
    {
       if (i >= octaves)
      		break;
   
        vec4 n = snoise(f*x*scale,vec3(0.));
        
          if (terbulance){
             n= abs(n);
       		}
        
            if (ridg){
             n = -1.*n;
       		}
        
        a += b*n.x;           // accumulate values		
        d += b*n.yzw*scale; // accumulate derivatives
        b *= 0.5;             // amplitude decrease
        f *= 1.8;             // frequency increase
    }

	return vec4( a, d );
}

`,[snoise])