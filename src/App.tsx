import React, { useEffect, useState } from "react";
import { createBox, createSphere, vec3, createEngine, createScene, createPerspectiveCamera, createPointLight } from "../lib";

import { memo } from "react";
import { createGround } from "../lib/meshes";
import { scale, translate } from "../lib/transform";

function App() {
  // const [fov, setFov] = useState("150");
  // const [cz, setCZ] = useState(0);
  // const [cx, setCX] = useState(0);
  // const [n, setN] = useState(1);
  // const [f, setF] = useState(99);
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

        // 俯视图
        // { target: vec3(0, 0, 1), position: vec3(0, 1, 1),up:vec3(0,0,1) },
        scene
      );
      const g = createGround("g", scene, {
        width: 5, height: 5
      });
      g.transform = translate(0, -2, 0).mul(g.transform)


      const box = createBox("b", scene, {
        width: 2, height: 2, depth: 2
      });

      box.transform = translate(-4, 1, 2).mul(box.transform)
      const box3 = createBox("b2", scene, { width: 12, height: 10, depth: 1 });
      box3.transform = translate(1, 0, 5).mul(box3.transform)
      const box4 = createBox("b2", scene, { width: 4, height: 4, depth: 1 });
      box4.transform = translate(4, 0, 1.5).mul(box4.transform)


      // two point light
      const light = createPointLight(
        "light1",
        { color: vec3(0, 0.4, 0), position: vec3(-1, -1, -1), intensity: 10, radius: 10 },
        scene
      );

      const light2 = createPointLight(
        "light2",
        { color: vec3(1, 1, 1), position: vec3(1, 1, -1), intensity: 5, radius: 5 },
        scene
      );

      await engine.loop(() => {

        // f 
        if (camera.f != 0) {
          camera.f -= 5

        }
        console.log("camera.f", camera.f);

        box.transform = translate(-0.02, 0, 0).mul(box.transform)

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
      {/* <div className="inputs">
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
      </div> */}
    </>
  );
}

export default memo(App);
