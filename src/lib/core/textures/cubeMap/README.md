# CubeMaphJS 
<p align="center">
  <img src="./img/objS.png" />
  <img src="./img/tanS.png" />
</p>


# Cube Map Texture Generator with Three.js

This repository contains a JavaScript application that uses the Three.js library to generate cube map textures with various noise and displacement effects. The codebase provides a \`CubeMapTexture\` class that facilitates the creation, customization, and export of cube map textures for use in 3D graphics applications.

## Table of Contents

- [Overview](#overview)
- [Usage](#usage)
- [Dependencies](#dependencies)
- [Installation](#installation)
- [Examples](#examples)
- [Contributing](#contributing)
- [License](#license)

## Overview

The Cube Map Texture Generator leverages Three.js to create and manipulate cube map textures. The main classes, \`CubeMap\` and \`CubeMapTexture\`, enable the generation of textured cube maps with various noise and displacement effects applied.

## Usage

To use the Cube Map Texture Generator, follow these steps:

1. Clone or download this repository to your local machine.

2. Ensure you have the required dependencies installed:
   - Three.js
   - ... (list any other dependencies)

3. Include the necessary dependencies in your project.

4. Import the \`CubeMapTexture\` class from the provided code.

5. Create an instance of the \`CubeMapTexture\` class:
   \`\`\`javascript
   const cm = new CubeMapTexture();
   \`\`\`

6. Build the cube map textures with a specified resolution:
   \`\`\`javascript
   cm.build(2048);
   \`\`\`

7. Customize the effects applied to the textures. For example:
   \`\`\`javascript
   cm.simplexNoiseFbm({
     // Set your desired parameters here
   });
   \`\`\`

8. Capture snapshots of the cube map textures:
   \`\`\`javascript
   cm.snapShot(false);
   \`\`\`

9. Retrieve the generated normal and displacement textures:
   \`\`\`javascript
   let DN = cm.getTexture();
   let N = DN.normal;
   let D = DN.displacement;
   \`\`\`

## Dependencies

- Three.js
- ... (list any other dependencies)

## Installation

1. Clone the repository:
   \`\`\`bash
   git clone https://github.com/your-username/cube-map-texture-generator.git
   \`\`\`

2. Navigate to the project folder:
   \`\`\`bash
   cd cube-map-texture-generator
   \`\`\`

3. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

## Examples

Check the provided \`example.js\` file for a practical example of how to use the Cube Map Texture Generator to create and export cube map textures with different noise and displacement effects.

## Contributing

Contributions are welcome! If you find a bug, have an enhancement suggestion, or would like to add new features, feel free to open issues and pull requests in this repository.

## License

This project is licensed under the [MIT License](LICENSE).