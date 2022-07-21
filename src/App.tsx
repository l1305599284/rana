import React, { useEffect } from "react";
import { render, Renderer } from "../lib";

function App() {
  useEffect(() => {
    render();
    // const canvas = document.getElementById(
    //   "webgpu-canvas"
    // ) as HTMLCanvasElement;

    // const renderer = new Renderer(canvas);
    // renderer.start();
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
      <div>
        <input type="range" min="0" max="1" step="0.02" id="tx" />
      </div>
    </>
  );
}

export default App;
