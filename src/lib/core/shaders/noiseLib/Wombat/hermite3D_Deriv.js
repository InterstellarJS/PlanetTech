//
//	Hermite3D_Deriv
//	Hermite3D noise with derivatives
//	returns vec3( value, xderiv, yderiv, zderiv )
//

export const Hermite3D_Deriv=`
vec4 FAST32_hash_3D_Cell( vec3 gridcell )	//	generates 4 different random numbers for the single given cell point
{
    //    gridcell is assumed to be an integer coordinate

    //	TODO: 	these constants need tweaked to find the best possible noise.
    //			probably requires some kind of brute force computational searching or something....
    const vec2 OFFSET = vec2( 50.0, 161.0 );
    const float DOMAIN = 69.0;
    const vec4 SOMELARGEFLOATS = vec4( 635.298681, 682.357502, 668.926525, 588.255119 );
    const vec4 ZINC = vec4( 48.500388, 65.294118, 63.934599, 63.279683 );

    //	truncate the domain
    gridcell.xyz = gridcell - floor(gridcell * ( 1.0 / DOMAIN )) * DOMAIN;
    gridcell.xy += OFFSET.xy;
    gridcell.xy *= gridcell.xy;
    return fract( ( gridcell.x * gridcell.y ) * ( 1.0 / ( SOMELARGEFLOATS + gridcell.zzzz * ZINC ) ) );
}

void FAST32_hash_3D( vec3 gridcell, out vec4 lowz_hash, out vec4 highz_hash )	//	generates a random number for each of the 8 cell corners
{
    //    gridcell is assumed to be an integer coordinate

    //	TODO: 	these constants need tweaked to find the best possible noise.
    //			probably requires some kind of brute force computational searching or something....
    const vec2 OFFSET = vec2( 50.0, 161.0 );
    const float DOMAIN = 69.0;
    const float SOMELARGEFLOAT = 635.298681;
    const float ZINC = 48.500388;

    //	truncate the domain
    gridcell.xyz = gridcell.xyz - floor(gridcell.xyz * ( 1.0 / DOMAIN )) * DOMAIN;
    vec3 gridcell_inc1 = step( gridcell, vec3( DOMAIN - 1.5 ) ) * ( gridcell + 1.0 );

    //	calculate the noise
    vec4 P = vec4( gridcell.xy, gridcell_inc1.xy ) + OFFSET.xyxy;
    P *= P;
    P = P.xzxz * P.yyww;
    highz_hash.xy = vec2( 1.0 / ( SOMELARGEFLOAT + vec2( gridcell.z, gridcell_inc1.z ) * ZINC ) );
    lowz_hash = fract( P * highz_hash.xxxx );
    highz_hash = fract( P * highz_hash.yyyy );
}
void FAST32_hash_3D( 	vec3 gridcell,
                        vec3 v1_mask,		//	user definable v1 and v2.  ( 0's and 1's )
                        vec3 v2_mask,
                        out vec4 hash_0,
                        out vec4 hash_1,
                        out vec4 hash_2	)		//	generates 3 random numbers for each of the 4 3D cell corners.  cell corners:  v0=0,0,0  v3=1,1,1  the other two are user definable
{
    //    gridcell is assumed to be an integer coordinate

    //	TODO: 	these constants need tweaked to find the best possible noise.
    //			probably requires some kind of brute force computational searching or something....
    const vec2 OFFSET = vec2( 50.0, 161.0 );
    const float DOMAIN = 69.0;
    const vec3 SOMELARGEFLOATS = vec3( 635.298681, 682.357502, 668.926525 );
    const vec3 ZINC = vec3( 48.500388, 65.294118, 63.934599 );

    //	truncate the domain
    gridcell.xyz = gridcell.xyz - floor(gridcell.xyz * ( 1.0 / DOMAIN )) * DOMAIN;
    vec3 gridcell_inc1 = step( gridcell, vec3( DOMAIN - 1.5 ) ) * ( gridcell + 1.0 );

    //	compute x*x*y*y for the 4 corners
    vec4 P = vec4( gridcell.xy, gridcell_inc1.xy ) + OFFSET.xyxy;
    P *= P;
    vec4 V1xy_V2xy = mix( P.xyxy, P.zwzw, vec4( v1_mask.xy, v2_mask.xy ) );		//	apply mask for v1 and v2
    P = vec4( P.x, V1xy_V2xy.xz, P.z ) * vec4( P.y, V1xy_V2xy.yw, P.w );

    //	get the lowz and highz mods
    vec3 lowz_mods = vec3( 1.0 / ( SOMELARGEFLOATS.xyz + gridcell.zzz * ZINC.xyz ) );
    vec3 highz_mods = vec3( 1.0 / ( SOMELARGEFLOATS.xyz + gridcell_inc1.zzz * ZINC.xyz ) );

    //	apply mask for v1 and v2 mod values
    v1_mask = ( v1_mask.z < 0.5 ) ? lowz_mods : highz_mods;
    v2_mask = ( v2_mask.z < 0.5 ) ? lowz_mods : highz_mods;

    //	compute the final hash
    hash_0 = fract( P * vec4( lowz_mods.x, v1_mask.x, v2_mask.x, highz_mods.x ) );
    hash_1 = fract( P * vec4( lowz_mods.y, v1_mask.y, v2_mask.y, highz_mods.y ) );
    hash_2 = fract( P * vec4( lowz_mods.z, v1_mask.z, v2_mask.z, highz_mods.z ) );
}
vec4 FAST32_hash_3D( 	vec3 gridcell,
                        vec3 v1_mask,		//	user definable v1 and v2.  ( 0's and 1's )
                        vec3 v2_mask )		//	generates 1 random number for each of the 4 3D cell corners.  cell corners:  v0=0,0,0  v3=1,1,1  the other two are user definable
{
    //    gridcell is assumed to be an integer coordinate

    //	TODO: 	these constants need tweaked to find the best possible noise.
    //			probably requires some kind of brute force computational searching or something....
    const vec2 OFFSET = vec2( 50.0, 161.0 );
    const float DOMAIN = 69.0;
    const float SOMELARGEFLOAT = 635.298681;
    const float ZINC = 48.500388;

    //	truncate the domain
    gridcell.xyz = gridcell.xyz - floor(gridcell.xyz * ( 1.0 / DOMAIN )) * DOMAIN;
    vec3 gridcell_inc1 = step( gridcell, vec3( DOMAIN - 1.5 ) ) * ( gridcell + 1.0 );

    //	compute x*x*y*y for the 4 corners
    vec4 P = vec4( gridcell.xy, gridcell_inc1.xy ) + OFFSET.xyxy;
    P *= P;
    vec4 V1xy_V2xy = mix( P.xyxy, P.zwzw, vec4( v1_mask.xy, v2_mask.xy ) );		//	apply mask for v1 and v2
    P = vec4( P.x, V1xy_V2xy.xz, P.z ) * vec4( P.y, V1xy_V2xy.yw, P.w );

    //	get the z mod vals
    vec2 V1z_V2z = vec2( v1_mask.z < 0.5 ? gridcell.z : gridcell_inc1.z, v2_mask.z < 0.5 ? gridcell.z : gridcell_inc1.z );
    vec4 mod_vals = vec4( 1.0 / ( SOMELARGEFLOAT + vec4( gridcell.z, V1z_V2z, gridcell_inc1.z ) * ZINC ) );

    //	compute the final hash
    return fract( P * mod_vals );
}
void FAST32_hash_3D( 	vec3 gridcell,
                        out vec4 lowz_hash_0,
                        out vec4 lowz_hash_1,
                        out vec4 lowz_hash_2,
                        out vec4 highz_hash_0,
                        out vec4 highz_hash_1,
                        out vec4 highz_hash_2	)		//	generates 3 random numbers for each of the 8 cell corners
{
    //    gridcell is assumed to be an integer coordinate

    //	TODO: 	these constants need tweaked to find the best possible noise.
    //			probably requires some kind of brute force computational searching or something....
    const vec2 OFFSET = vec2( 50.0, 161.0 );
    const float DOMAIN = 69.0;
    const vec3 SOMELARGEFLOATS = vec3( 635.298681, 682.357502, 668.926525 );
    const vec3 ZINC = vec3( 48.500388, 65.294118, 63.934599 );

    //	truncate the domain
    gridcell.xyz = gridcell.xyz - floor(gridcell.xyz * ( 1.0 / DOMAIN )) * DOMAIN;
    vec3 gridcell_inc1 = step( gridcell, vec3( DOMAIN - 1.5 ) ) * ( gridcell + 1.0 );

    //	calculate the noise
    vec4 P = vec4( gridcell.xy, gridcell_inc1.xy ) + OFFSET.xyxy;
    P *= P;
    P = P.xzxz * P.yyww;
    vec3 lowz_mod = vec3( 1.0 / ( SOMELARGEFLOATS.xyz + gridcell.zzz * ZINC.xyz ) );
    vec3 highz_mod = vec3( 1.0 / ( SOMELARGEFLOATS.xyz + gridcell_inc1.zzz * ZINC.xyz ) );
    lowz_hash_0 = fract( P * lowz_mod.xxxx );
    highz_hash_0 = fract( P * highz_mod.xxxx );
    lowz_hash_1 = fract( P * lowz_mod.yyyy );
    highz_hash_1 = fract( P * highz_mod.yyyy );
    lowz_hash_2 = fract( P * lowz_mod.zzzz );
    highz_hash_2 = fract( P * highz_mod.zzzz );
}
void FAST32_hash_3D( 	vec3 gridcell,
                        out vec4 lowz_hash_0,
                        out vec4 lowz_hash_1,
                        out vec4 lowz_hash_2,
                        out vec4 lowz_hash_3,
                        out vec4 highz_hash_0,
                        out vec4 highz_hash_1,
                        out vec4 highz_hash_2,
                        out vec4 highz_hash_3	)		//	generates 4 random numbers for each of the 8 cell corners
{
    //    gridcell is assumed to be an integer coordinate

    //	TODO: 	these constants need tweaked to find the best possible noise.
    //			probably requires some kind of brute force computational searching or something....
    const vec2 OFFSET = vec2( 50.0, 161.0 );
    const float DOMAIN = 69.0;
    const vec4 SOMELARGEFLOATS = vec4( 635.298681, 682.357502, 668.926525, 588.255119 );
    const vec4 ZINC = vec4( 48.500388, 65.294118, 63.934599, 63.279683 );

    //	truncate the domain
    gridcell.xyz = gridcell.xyz - floor(gridcell.xyz * ( 1.0 / DOMAIN )) * DOMAIN;
    vec3 gridcell_inc1 = step( gridcell, vec3( DOMAIN - 1.5 ) ) * ( gridcell + 1.0 );

    //	calculate the noise
    vec4 P = vec4( gridcell.xy, gridcell_inc1.xy ) + OFFSET.xyxy;
    P *= P;
    P = P.xzxz * P.yyww;
    lowz_hash_3.xyzw = vec4( 1.0 / ( SOMELARGEFLOATS.xyzw + gridcell.zzzz * ZINC.xyzw ) );
    highz_hash_3.xyzw = vec4( 1.0 / ( SOMELARGEFLOATS.xyzw + gridcell_inc1.zzzz * ZINC.xyzw ) );
    lowz_hash_0 = fract( P * lowz_hash_3.xxxx );
    highz_hash_0 = fract( P * highz_hash_3.xxxx );
    lowz_hash_1 = fract( P * lowz_hash_3.yyyy );
    highz_hash_1 = fract( P * highz_hash_3.yyyy );
    lowz_hash_2 = fract( P * lowz_hash_3.zzzz );
    highz_hash_2 = fract( P * highz_hash_3.zzzz );
    lowz_hash_3 = fract( P * lowz_hash_3.wwww );
    highz_hash_3 = fract( P * highz_hash_3.wwww );
}


//
//	FastHash32_2
//
//	An alternative to FastHash32
//	- slightly slower
//	- can have a larger domain
//	- allows for a 4D implementation
//
//	(eg)4D is computed like so....
//	coord = mod( coord, DOMAIN );
//	coord = ( coord * SCALE ) + OFFSET;
//	coord *= coord;
//	hash = mod( coord.x * coord.y * coord.z * coord.w, SOMELARGEFLOAT ) / SOMELARGEFLOAT;
//


float QuinticHermite( float x, float ival0, float ival1, float egrad0, float egrad1 )		// quintic hermite with start/end acceleration of 0.0
{
    const vec3 C0 = vec3( -15.0, 8.0, 7.0 );
    const vec3 C1 = vec3( 6.0, -3.0, -3.0 );
    const vec3 C2 = vec3( 10.0, -6.0, -4.0 );
    vec3 h123 = ( ( ( C0 + C1 * x ) * x ) + C2 ) * ( x*x*x );
    return ival0 + dot( vec3( (ival1 - ival0), egrad0, egrad1 ), h123.xyz + vec3( 0.0, x, 0.0 ) );
}
vec4 QuinticHermite( float x, vec4 ival0, vec4 ival1, vec4 egrad0, vec4 egrad1 )		// quintic hermite with start/end acceleration of 0.0
{
    const vec3 C0 = vec3( -15.0, 8.0, 7.0 );
    const vec3 C1 = vec3( 6.0, -3.0, -3.0 );
    const vec3 C2 = vec3( 10.0, -6.0, -4.0 );
    vec3 h123 = ( ( ( C0 + C1 * x ) * x ) + C2 ) * ( x*x*x );
    return ival0 + (ival1 - ival0) * h123.xxxx + egrad0 * vec4( h123.y + x ) + egrad1 * h123.zzzz;
}
vec4 QuinticHermite( float x, vec2 igrad0, vec2 igrad1, vec2 egrad0, vec2 egrad1 )		// quintic hermite with start/end position and acceleration of 0.0
{
    const vec3 C0 = vec3( -15.0, 8.0, 7.0 );
    const vec3 C1 = vec3( 6.0, -3.0, -3.0 );
    const vec3 C2 = vec3( 10.0, -6.0, -4.0 );
    vec3 h123 = ( ( ( C0 + C1 * x ) * x ) + C2 ) * ( x*x*x );
    return vec4( egrad1, igrad0 ) * vec4( h123.zz, 1.0, 1.0 ) + vec4( egrad0, h123.xx ) * vec4( vec2( h123.y + x ), (igrad1 - igrad0) );	//	returns vec4( out_ival.xy, out_igrad.xy )
}
void QuinticHermite( 	float x,
                        vec4 ival0, vec4 ival1,			//	values are interpolated using the gradient arguments
                        vec4 igrad_x0, vec4 igrad_x1, 	//	gradients are interpolated using eval gradients of 0.0
                        vec4 igrad_y0, vec4 igrad_y1,
                        vec4 egrad0, vec4 egrad1, 		//	our evaluation gradients
                        out vec4 out_ival, out vec4 out_igrad_x, out vec4 out_igrad_y )	// quintic hermite with start/end acceleration of 0.0
{
    const vec3 C0 = vec3( -15.0, 8.0, 7.0 );
    const vec3 C1 = vec3( 6.0, -3.0, -3.0 );
    const vec3 C2 = vec3( 10.0, -6.0, -4.0 );
    vec3 h123 = ( ( ( C0 + C1 * x ) * x ) + C2 ) * ( x*x*x );
    out_ival = ival0 + (ival1 - ival0) * h123.xxxx + egrad0 * vec4( h123.y + x ) + egrad1 * h123.zzzz;
    out_igrad_x = igrad_x0 + (igrad_x1 - igrad_x0) * h123.xxxx;	//	NOTE: gradients of 0.0
    out_igrad_y = igrad_y0 + (igrad_y1 - igrad_y0) * h123.xxxx;	//	NOTE: gradients of 0.0
}
void QuinticHermite( 	float x,
                        vec4 igrad_x0, vec4 igrad_x1, 	//	gradients are interpolated using eval gradients of 0.0
                        vec4 igrad_y0, vec4 igrad_y1,
                        vec4 egrad0, vec4 egrad1, 		//	our evaluation gradients
                        out vec4 out_ival, out vec4 out_igrad_x, out vec4 out_igrad_y )	// quintic hermite with start/end position and acceleration of 0.0
{
    const vec3 C0 = vec3( -15.0, 8.0, 7.0 );
    const vec3 C1 = vec3( 6.0, -3.0, -3.0 );
    const vec3 C2 = vec3( 10.0, -6.0, -4.0 );
    vec3 h123 = ( ( ( C0 + C1 * x ) * x ) + C2 ) * ( x*x*x );
    out_ival = egrad0 * vec4( h123.y + x ) + egrad1 * h123.zzzz;
    out_igrad_x = igrad_x0 + (igrad_x1 - igrad_x0) * h123.xxxx;	//	NOTE: gradients of 0.0
    out_igrad_y = igrad_y0 + (igrad_y1 - igrad_y0) * h123.xxxx;	//	NOTE: gradients of 0.0
}
float QuinticHermiteDeriv( float x, float ival0, float ival1, float egrad0, float egrad1 )	// gives the derivative of quintic hermite with start/end acceleration of 0.0
{
    const vec3 C0 = vec3( 30.0, -15.0, -15.0 );
    const vec3 C1 = vec3( -60.0, 32.0, 28.0 );
    const vec3 C2 = vec3( 30.0, -18.0, -12.0 );
    vec3 h123 = ( ( ( C1 + C0 * x ) * x ) + C2 ) * ( x*x );
    return dot( vec3( (ival1 - ival0), egrad0, egrad1 ), h123.xyz + vec3( 0.0, 1.0, 0.0 ) );
}



vec4 Hermite3D_Deriv( vec3 P )
{
    //	establish our grid cell and unit position
    vec3 Pi = floor(P);
    vec3 Pf = P - Pi;

    //	calculate the hash.
    //	( various hashing methods listed in order of speed )
    vec4 hash_gradx0, hash_grady0, hash_gradz0, hash_gradx1, hash_grady1, hash_gradz1;
    FAST32_hash_3D( Pi, hash_gradx0, hash_grady0, hash_gradz0, hash_gradx1, hash_grady1, hash_gradz1 );

    //	scale the hash values
    hash_gradx0 = ( hash_gradx0 - 0.49999);
    hash_grady0 = ( hash_grady0 - 0.49999);
    hash_gradz0 = ( hash_gradz0 - 0.49999);
    hash_gradx1 = ( hash_gradx1 - 0.49999);
    hash_grady1 = ( hash_grady1 - 0.49999);
    hash_gradz1 = ( hash_gradz1 - 0.49999);

#if 1
    //	normalize gradients
    vec4 norm0 = inversesqrt( hash_gradx0 * hash_gradx0 + hash_grady0 * hash_grady0 + hash_gradz0 * hash_gradz0 );
    hash_gradx0 *= norm0;
    hash_grady0 *= norm0;
    hash_gradz0 *= norm0;
    vec4 norm1 = inversesqrt( hash_gradx1 * hash_gradx1 + hash_grady1 * hash_grady1 + hash_gradz1 * hash_gradz1 );
    hash_gradx1 *= norm1;
    hash_grady1 *= norm1;
    hash_gradz1 *= norm1;
    const float FINAL_NORM_VAL = 1.8475208614068024464292760976063;
#else
    //	unnormalized gradients
    const float FINAL_NORM_VAL = (1.0/0.46875);  // = 1.0 / ( 0.5 * 0.3125 * 3.0 )
#endif

    //
    //	NOTE:  This stuff can be optimized further.
    //	But it also appears the compiler is doing a lot of that automatically for us anyway
    //

    //	drop things from three dimensions to two
    vec4 ival_results_z, igrad_results_x_z, igrad_results_y_z;
    QuinticHermite( Pf.z, hash_gradx0, hash_gradx1, hash_grady0, hash_grady1, hash_gradz0, hash_gradz1, ival_results_z, igrad_results_x_z, igrad_results_y_z );

    vec4 ival_results_y, igrad_results_x_y, igrad_results_z_y;
    QuinticHermite( Pf.y, 	vec4( hash_gradx0.xy, hash_gradx1.xy ), vec4( hash_gradx0.zw, hash_gradx1.zw ),
                            vec4( hash_gradz0.xy, hash_gradz1.xy ), vec4( hash_gradz0.zw, hash_gradz1.zw ),
                            vec4( hash_grady0.xy, hash_grady1.xy ), vec4( hash_grady0.zw, hash_grady1.zw ),
                            ival_results_y, igrad_results_x_y, igrad_results_z_y );

    //	drop things from two dimensions to one
    vec4 qh_results_x = QuinticHermite( Pf.y, vec4(ival_results_z.xy, igrad_results_x_z.xy), vec4(ival_results_z.zw, igrad_results_x_z.zw), vec4( igrad_results_y_z.xy, 0.0, 0.0 ), vec4( igrad_results_y_z.zw, 0.0, 0.0 ) );
    vec4 qh_results_y = QuinticHermite( Pf.x, vec4(ival_results_z.xz, igrad_results_y_z.xz), vec4(ival_results_z.yw, igrad_results_y_z.yw), vec4( igrad_results_x_z.xz, 0.0, 0.0 ), vec4( igrad_results_x_z.yw, 0.0, 0.0 ) );
    vec4 qh_results_z = QuinticHermite( Pf.x, vec4(ival_results_y.xz, igrad_results_z_y.xz), vec4(ival_results_y.yw, igrad_results_z_y.yw), vec4( igrad_results_x_y.xz, 0.0, 0.0 ), vec4( igrad_results_x_y.yw, 0.0, 0.0 ) );

    //	for each hermite curve calculate the derivative
    float deriv_x = QuinticHermiteDeriv( Pf.x, qh_results_x.x, qh_results_x.y, qh_results_x.z, qh_results_x.w );
    float deriv_y = QuinticHermiteDeriv( Pf.y, qh_results_y.x, qh_results_y.y, qh_results_y.z, qh_results_y.w );
    float deriv_z = QuinticHermiteDeriv( Pf.z, qh_results_z.x, qh_results_z.y, qh_results_z.z, qh_results_z.w );

    //	and also the final noise value off any one of them
    float finalpos = QuinticHermite( Pf.x, qh_results_x.x, qh_results_x.y, qh_results_x.z, qh_results_x.w );

    //	normalize and return results! :)
    return vec4( finalpos, deriv_x, deriv_y, deriv_z ) * FINAL_NORM_VAL;
}`