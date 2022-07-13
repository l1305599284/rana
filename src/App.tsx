import React, { useEffect } from "react";
import { render } from "../lib";

function App() {
  useEffect(() => {
    render();
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
      <canvas id="webgpu-canvas" width="640" height="480"></canvas>
    </div>
  );
}

export default App;
