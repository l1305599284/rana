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
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "1em",
      }}
    >
      <canvas id="webgpu-canvas" width="640" height="640"></canvas>
    </div>
  );
}

export default App;
