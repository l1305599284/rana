import React, { useEffect, useState } from "react";
import { createBox, createSphere, vec3, createEngine, createScene, createPerspectiveCamera, createPointLight } from "../lib";

import { memo } from "react";

function App() {
  const [fov, setFov] = useState("150");
  const [cz, setCZ] = useState(0);
  const [cx, setCX] = useState(0);
  const [n, setN] = useState(1);
  const [f, setF] = useState(99);
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
        { target: vec3(0, 0, 1), position: vec3(0, 0, -1) },
        scene
      );

      for (let i = 0; i < 25; i++) {
        // createBox("b"+i, scene);
        createSphere("b" + i, scene);
      }

      const light = createPointLight(
        "light1",
        { color: vec3(0.5, 0, 0), position: vec3(-1, -1, -1), intensity: 50, radius: 5 },
        scene
      );

      const light2 = createPointLight(
        "light2",
        { color: vec3(1, 1, 1), position: vec3(1, 1, -1), intensity: 4, radius: 5 },
        scene
      );

      await engine.loop(() => {
        camera.target = camera.target.add(vec3(0.1, 0, 0))
        light.position = light.position.add(vec3(0, 0.01, 0))
        light2.position = light2.position.add(vec3(0, -0.01, 0))
        scene.render();
      });
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
        <canvas
          id="webgpu-canvas"
          width="512"
          height="512
        ."
        ></canvas>
      </div>
      <div className="inputs">
        <div>
          <span>Point Light color</span> <input id="plc" type="color" />
        </div>
        <div>
          <span>Point Light x</span>
          <input id="plx" type="range" min="-5" max="5" step="0.01" value="0" />
        </div>
        <div>
          <span>Point Light y</span>
          <input id="ply" type="range" min="-5" max="5" step="0.01" value="0" />
        </div>
        <div>
          <span>Point Light z</span>
          <input id="plz" type="range" min="-5" max="5" step="0.01" value="0" />
        </div>
        <div>
          <span>Point Light Intensity</span>
          <input id="pli" type="range" min="0" max="10" step="0.05" value="1" />
        </div>
        <div>
          <span>Point Light Radius</span>
          <input id="plr" type="range" min="0" max="50" step="0.1" value="5" />
        </div>

        <div>
          <span>camera.x:{cx}</span>
          <input
            id="cx"
            type="range"
            min="-1"
            max="1"
            step="0.01"
            value={cx}
            onChange={(e) => {
              setCX((e.target.value as any) * 1);
            }}
          />
        </div>

        <div>
          <span>camera.z:{cz}</span>
          <input
            id="cz"
            type="range"
            min="-2"
            max="1"
            step="0.1"
            value={cz}
            onChange={(e) => {
              setCZ((e.target.value as any) * 1);
            }}
          />
        </div>

        <div>
          <span>fov:{fov}</span>
          <input
            onChange={(e) => {
              setFov(e.target.value);
            }}
            id="fov"
            type="range"
            min="0"
            max="180"
            step="1"
            value={fov}
          />
        </div>
        <div>
          <span>n:{n}</span>
          <input
            onChange={(e) => {
              setN((e.target.value as any) * 1);
            }}
            id="n"
            type="range"
            min="-5"
            max="10"
            step="1"
            value={n}
          />
        </div>
        <div>
          <span>f:{f}</span>
          <input
            onChange={(e) => {
              setF((e.target.value as any) * 1);
            }}
            id="f"
            type="range"
            min="1"
            max="100"
            step="1"
            value={f}
          />
        </div>
      </div>
    </>
  );
}

export default memo(App);
