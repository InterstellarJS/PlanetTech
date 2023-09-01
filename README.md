⚠️ **Disclaimer:** PlanetTechJS is currently in its alpha version and is being developed by a single developer. As a result, it's important to keep in mind that there may be bugs, spelling errors,no tests, and occasional inconsistencies in the library. While every effort is being made to provide a stable and enjoyable experience, please approach the library with the understanding that it's a work in progress. Your feedback, bug reports, and contributions are highly appreciated as they play a crucial role in improving the library and ensuring its quality.


# PlanetTechJS (ALPHA V0.0) 
![Example Planet](./public/readmeImg/example-planet.png)

<p align="center">
  <img src="./public/readmeImg/img6.png" />
</p>


**GOAL:**
PlanetTechJS is an open-source JavaScript library built using vanilla THREE.js, accompanied by a React UI, aimed at generating procedural planets and terrains. The goal of this project isn't to replicate titles like Star Citizen or No Man's Sky, but rather to provide a toolkit that emulates the tools they might utilize for planet creation. The focus is solely on crafting planets, offering a straightforward and adaptable approach to designing realistic and visually captivating 3D planets on a grand scale. This includes customizable features such as terrain height, textures, ground and flight physics, atmospheric effects, and more. So, it does not encompass spaceship, weapons, player dynamics, etc. Only planet generating.

What sets this library apart is its utilization of the GPU for all tasks. From generating textures for each facet to performing displacement and shaping PlaneGeometries into spherical forms, the entire process occurs on the GPU. As such, there is no need for WebWorkers at this stage

## Features
- Procedural planet generation: Create unique and realistic planets using procedural algorithms.
- flexability and speed.
- quadtree sphere.
- cubeMap threading.
- Terrain generation: Generate detailed and customizable terrains with different types of landscapes such as mountains, valleys, and plains.
- Texture mapping: Apply textures to the terrain to enhance visual realism and add visual variety.(coming soon)
- Gpu generated normal map.(coming soon)
- Gpu generated displacement map.(coming soon)
- Atmospheric effects: Simulate atmospheric effects such as clouds, haze, and lighting to create a more immersive environment.(coming soon)
- User interaction: Allow users to interact with the generated planet by zooming, rotating, and exploring different regions.(coming soon)
- Texture editing / terrain editing. (coming soon)
- Texture Atlas. (coming soon)
- Texture channel packing.(coming soon)
- Texture Splat Map.(coming soon)
- Physics. (coming soon)
- assets.  (coming soon)
- foliage. (coming soon)


## How It Works
Let's create a basic quadtree sphere without any textures or displacement, just coloring each dimension to show what's going on under the hood.
```javascript

import Sphere from './core/sphere/sphere'
import { getRandomColor,hexToRgbA } from './core/sphere/utils'

  const params = {
    width: 100,
    height: 100,
    widthSegment: 50,
    heightSegment: 50,
    quadTreeDimensions: 1,
    levels: 2,
    radius: 100,
    displacmentScale:1,
    color: () => NODE.vec3(...hexToRgbA(getRandomColor())),
 }



 let s = new Sphere(
    params.width,
    params.height,
    params.widthSegment,
    params.heightSegment,
    params.quadTreeDimensions
    )

  s.build(
    params.levels,
    params.radius,
    params.displacmentScale,
    params.color
  )

 scene.add(s.sphere);

```
![quad Sphere](./public/readmeImg/img2.png)

Now let's crank up the `levels` all the way to 10 (a reasonable number without my machine freezing up). So you'll be creating a sphere with 10x10x6 dimensions at a resolution of 50. You can play with the parameters to fit your needs; the only limitation is your machine.
![quad Sphere](./public/readmeImg/img3.png)

To get a better understanding of the `levels` parameter, let's take a look at a single quad (single dimension). If we were to grab a quad from thatour sphere without the projection and adding a simple height map texture. Setting `params.levels = 6` gives a single dimension the ability to go six levels deep. As you can see each child in each level with a random color. 
![quad Sphere](./public/readmeImg/img4.jpg)

Now lets say we want to add a texture to our sphere and start making it look like a planet.
the code will be the same as before except now we are using `addTexture` method.
```javascript
  const params = {
    width: 100,
    height: 100,
    widthSegment: 50,
    heightSegment: 50,
    quadTreeDimensions: 3,
    levels: 2,
    radius: 100,
    displacmentScale:5,
 }

 var s = new Sphere(
    params.width,
    params.height,
    params.widthSegment,
    params.heightSegment,
    params.quadTreeDimensions
    )

  s.build(
    params.levels,
    params.radius,
    params.displacmentScale,
  )

  const loader1 = new THREE.TextureLoader().load('./worldTextures/front_image.png' );
  const loader2 = new THREE.TextureLoader().load('./worldTextures/back_image.png'  );
  const loader3 = new THREE.TextureLoader().load('./worldTextures/right_image.png' );
  const loader4 = new THREE.TextureLoader().load('./worldTextures/left_image.png'  );
  const loader5 = new THREE.TextureLoader().load('./worldTextures/top_image.png'   );
  const loader6 = new THREE.TextureLoader().load('./worldTextures/bottom_image.png');

  s.front .addTexture ([loader1,loader1], params.displacmentScale)
  s.back  .addTexture ([loader2,loader2], params.displacmentScale)
  s.right .addTexture ([loader3,loader3], params.displacmentScale)
  s.left  .addTexture ([loader4,loader4], params.displacmentScale)
  s.top   .addTexture ([loader5,loader5], params.displacmentScale)
  s.bottom.addTexture ([loader6,loader6], params.displacmentScale)

```
Notice we dont need the color anymore. And all we added was a THREE.TextureLoader for loading a texture for each face of the planet, increase `quadTreeDimensions` to 3 and increase `displacmentScale` to 5.
`addTexture` method first argument takes an array. The first item in that arry is a texture to be drawn the second item is a texture for displacement.
<p align="center">
  <img src="./public/readmeImg/img8.png" width="500" />
</p>

PlanetTechJS comes with an experimental feature called [CubeMapJS](./src/lib/core/textures/cubeMap). CubeMapJS allows a user to create procedurally generated cube textures that return displacement maps and normal maps. CubeMapJS can generate displacement and normal maps in tangent space, as well as analytical noise derivatives that generate world space normal maps.

⚠️ **Disclaimer:** In some cases, the normal map can cause seams between each face of the texture, which can break the immersion for the user. In most case the seam can be ignored because they are negligible. 


<p align="center">
  World space normal:
  <img src="./public/readmeImg/no.png"    />
  World space normal with light:
  <img src="./public/readmeImg/objSS.png" />
</p>

<p align="center">
  tangent space normal:
  <img  src="./public/readmeImg/nt.png"  />
  tangent space normal with light:
  <img  src="./public/readmeImg/tanSS.png" />
</p>

## Apache License 2.0.
[License](./LICENSE.txt)
This license  allows contributions to be open-source  while also ensuring that the project as a whole remains open and accessible to others.
Under the Apache License 2.0, contributors retain the copyright to their individual contributions while granting a license to others to use, modify, and distribute the project as a whole. This means that someone cannot claim the entire project as their own, but they can claim ownership of their individual contributions.
