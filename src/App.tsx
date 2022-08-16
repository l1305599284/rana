import React, { useEffect } from "react";
import { render } from "../lib";

function App() {
  useEffect(() => {
    (async () => {
      const canvas = document.getElementById(
        "webgpu-canvas"
      ) as HTMLCanvasElement;

      if (!canvas) {
        console.error("canvas is not exist.");
      }
      render(canvas);

      // const { render, createScene, createCamera, geo } = await createEngine(
      //   canvas
      // );
      // const { createSphere } = geo;
      // const sphere = createSphere();
      // const camera = createCamera();
      // const scene = createScene();
      // scene.add(sphere);
      // render(scene, camera);
    })();
  }, []);
  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "1em",
        }}
      >
        <canvas id="webgpu-canvas" width="128" height="128"></canvas>
      </div>
    </>
  );
}

export default App;
