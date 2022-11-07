<!-- markdownlint-disable-next-line -->
<p align="center">
  <img src="./images/logo.jpg" alt="rana: The Next Generation WebGPU Engine">
  
</p>
<h1 align="center">Rana</h1>

<div align="center">

[![license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/mui-org/material-ui/blob/HEAD/LICENSE)
[![npm latest package](https://img.shields.io/npm/v/@mui/material/latest.svg)](https://www.npmjs.com/package/@mui/material)
[![npm next package](https://img.shields.io/npm/v/@mui/material/next.svg)](https://www.npmjs.com/package/@mui/material)
[![npm downloads](https://img.shields.io/npm/dm/@mui/material.svg)](https://www.npmjs.com/package/@mui/material)
[![Coverage Status](https://img.shields.io/codecov/c/github/mui-org/material-ui/master.svg)](https://codecov.io/gh/mui-org/material-ui/branch/master)
[![Renovate status](https://img.shields.io/badge/renovate-enabled-brightgreen.svg)](https://github.com/mui-org/material-ui/issues/27062)
[![Average time to resolve an issue](https://isitmaintained.com/badge/resolution/mui-org/material-ui.svg)](https://isitmaintained.com/project/mui-org/material-ui "Average time to resolve an issue")
[![Crowdin](https://badges.crowdin.net/material-ui-docs/localized.svg)](https://translate.mui.com/project/material-ui-docs)

</div>

## Introduction

The Next Generation WebGPU Engine

## Browser Support

Recent versions of **Firefox**, **Chrome**, **Edge**, **Opera** and **Safari**. **IE11+**

## Major features

- next-generation web 3d solution
- ES6 and CommonJS modules
- Tree shaking of ES6 modules
- Almost the **best API** to use on the market
- Sophisticated and elegant style design
- An [API](https:///) for JavaScript and Typescript

## CDN Links

- https://cdn.jsdelivr.net/npm/rana/dist/index.umd.js

# Install inside a NPM project

```bash
# npm
npm install rana
```

```bash
# yarn
yarn add rana
```

```bash
# pnpm
pnpm add rana
```

## Use

### Use individual components:

Here is a quick react example to get you started, **it's all you need**:

```jsx
import { createBox, createSphere, vec3, createEngine, createScene, createPerspectiveCamera, createPointLight } from "../lib";
import { createGround } from "../lib/meshes";
import { scale, translate } from "../lib/transform";
import React,{ useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Button } from 'rana-ui';

function App() {
  useEffect(() => {
    (async () => {
      const canvas = document.getElementById(
        "webgpu-canvas"
      ) as HTMLCanvasElement;

      if (!canvas) {
        console.error("canvas is not exist.");
      }

      const engine = createEngine(canvas);
      const scene = createScene(engine);

      const camera = createPerspectiveCamera(
        "c1",
        { target: vec3(0, 0, 1), position: vec3(0, 0, -1), up: vec3(0, 1, 0) },
        scene
      );


      const box = createBox("b", scene, {
        width: 2, height: 2, depth: 2
      });


      const light = createPointLight(
        "light1",
        { color: vec3(0, 0.4, 0), position: vec3(-1, -1, -1), intensity: 10, radius: 10 },
        scene
      );

      await engine.loop(() => {
        box.transform = translate(-0.02, 0, 0).mul(box.transform)
        scene.render();
      });
    })();
  }, []);

  return <canvas
          id="webgpu-canvas"
          width="512"
          height="512
        ."
        ></canvas>;
}

ReactDOM.render(<App />, document.querySelector('#app'));
```

## License

This project is licensed under the terms of the
[MIT license](/LICENSE).