# CubeMaphJS 
<p align="center">
  <img src="./img/objS.png" />
  <img src="./img/tanS.png" />
</p>


# Cube Map Texture Generator with Three.js

This repository contains a JavaScript application that uses the Three.js library to generate cube map textures with various noise and displacement effects. 

## Overview

The Cube Map Texture Generator leverages Three.js to create and manipulate cube map textures. The main classes, \`CubeMap\` and \`CubeMapTexture\`, enable the generation of textured cube maps with various noise and displacement effects applied.


## Dependencies

- Three.js

## Examples
How to use the Cube Map create and export cube map textures with different noise and displacement effects.
```javaScript
  const cm = new CubeMap(1000,10) //set the dimesions of each plane objects and the number of tiles
  cm.build()
  cm.snapShot() // take a picture of the current frame
  let texture = cm.textuerArray // returns a array of 6 canvas textures
```
## Contributing

Contributions are welcome! If you find a bug, have an enhancement suggestion, or would like to add new features, feel free to open issues and pull requests in this repository.

## License

This project is licensed under the [MIT License](LICENSE).