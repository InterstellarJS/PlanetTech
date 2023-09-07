⚠️ **Disclaimer:** CubeMapJS isn't optimized yet; increasing the grid size to a large amount can cause WebGL to crash and may result in a lost context. Additionally, in some cases, the normal map can cause seams between each face of the texture, which can break the immersion for the user. In most cases, the seams can be ignored because they are negligible. 

CubeMapJS is currently in its alpha version and is being developed by a single developer. Consequently, it's important to keep in mind that there may be bugs, spelling errors, lack of tests, and occasional inconsistencies in the library. While every effort is being made to provide a stable and enjoyable experience, please approach the library with the understanding that it's a work in progress. Your feedback, bug reports, and contributions are highly appreciated as they play a crucial role in improving the library and ensuring its quality.

# CubeMaphJS 
<p align="center">
  <img src="./img/objS.png" />
  <img src="./img/tanS.png" />
</p>


## Overview

CubeMapJS allows users to create procedurally generated cube textures that return displacement maps and normal maps for each face. CubeMapJS can generate displacement and normal maps in tangent space, as well as analytical noise derivatives that produce world space normal maps. CubeMapJS works by dividing an image into a specific number of tiles, with each tile covering a small area at a predetermined resolution.


## Dependencies
- Three.js

## Examples
Here, we initialize a CubeMap, setting the width and height of the noise space to 2000 and specifying that we want a 5x5 grid (tiles) with `mapType` set to `true` for normal map. We then call the build method, creating the cube with the specified resolution (512*2) for each tile. Next, we call one of the noise methods with the following parameters. Finally, we call the download method. If set to true, this method downloads the images to your computer. The `.textureArray` variable holds the images in memory. It's important to note that working with high-resolution tiles can be computationally intensive, requiring more processing power and storage capacity.

```javaScript
  const cm = new CubeMap(2000,5,true)
  const download = true
  cm.build(512*2)
  cm.simplexNoiseFbm({
    inScale:            0.2,
    scale:              0.5,
    radius:             100,
    scaleHeightOutput:   .6,
    seed:              6.15,
    normalScale:        .01,
    redistribution:      4.,
    persistance:         .4,
    lacunarity:          2.,
    iteration:           12,
    terbulance:       false,
    ridge:            false,
  })
  cm.snapShot(download)
  let t = cm.textuerArray
```

`cm.snapShot` will take a long time if a higher resolution is set. For a faster workflow, you can validate and download each face separately. Calling each method one at a time will make the workload easier on your computer.

```javaScript 
const download = true
cm.snapShotFront (download)
cm.snapShotBack  (download)
cm.snapShotRight (download)
cm.snapShotLeft  (download)
cm.snapShotTop   (download)
cm.snapShotBottom(download)

``` 

## Noise Methods

- simplexNoise

- simplexNoiseFbm

- simplexNoiseFbmWarp

- ... adding more 



## Contributing

Contributions are welcome! If you find a bug, have an enhancement suggestion, or would like to add new features, feel free to open issues and pull requests in this repository.

## License

This project is licensed under the [Apache License 2.0.](LICENSE).