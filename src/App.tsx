import React, { useEffect } from "react";
import { render, Renderer } from "../lib";

function App() {
  useEffect(() => {
    (async () => {
      const canvas = document.getElementById(
        "webgpu-canvas"
      ) as HTMLCanvasElement;

      if (!canvas) {
        console.error("canvas is not exist.");
      }
      const engine = await render(canvas);
      engine.start();
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
      <div>
        <input type="range" min="0" max="1" step="0.02" id="tx" />
      </div>
    </>
  );
}

export default App;
