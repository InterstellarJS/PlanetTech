# WorldTechJS

![Example Planet](./public/readmeImg/example-planet.png)![Example Planet](./public/readmeImg/img1.png)


WorldTechJS is a JavaScript library for generating procedural planets and terrains. It provides a simple and flexible way to create realistic and visually appealing 3D planets with customizable features such as terrain height, textures, and atmospheric effects.


## Features
- quadtree sphere
- Procedural planet generation: Create unique and realistic planets using procedural algorithms.
- Terrain generation: Generate detailed and customizable terrains with different types of landscapes such as mountains, valleys, and plains.
- Texture mapping: Apply textures to the terrain to enhance visual realism and add visual variety.
- Gpu generated normal map.
- Gpu generated displacement map.
- Atmospheric effects: Simulate atmospheric effects such as clouds, haze, and lighting to create a more immersive environment.
- User interaction: Allow users to interact with the generated planet by zooming, rotating, and exploring different regions.


## Examples
let create a basic quadtree sphere without any textures or displacment.
```javascript

import Sphere from './core/sphere/sphere'

 const params = {
    width: 100
    height: 100
    widthSegment: 50
    heightSegment: 50
    quadTreeDimensions: 1
    levels: 1
    radius: 100
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
  )

 scene.add(s.sphere);

```
![quad Sphere](./public/readmeImg/img2.png)