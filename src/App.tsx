import React, { useEffect, useState } from "react";
import { render, createEngine, createScene } from "../lib";
const NUM = 3;
function App() {
  const [fov, setFov] = useState("150");
  const [cz, setCZ] = useState(0);
  const [cx, setCX] = useState(0);
  const [n, setN] = useState(1);
  const [f, setF] = useState(99);
  useEffect(() => {
    const canvas = document.getElementById(
      "webgpu-canvas"
    ) as HTMLCanvasElement;

    if (!canvas) {
      console.error("canvas is not exist.");
    }
    render(canvas);
    // const engine = createEngine(canvas);
    // const boxBuffer = {
    //   vertex: createVertexBuffer("box vertex", box.vertex.byteLength, device),
    //   index: createIndexBuffer("box index", box.index.byteLength, device),
    // };

    // device.queue.writeBuffer(boxBuffer.vertex, 0, box.vertex);
    // device.queue.writeBuffer(boxBuffer.index, 0, box.index);

    // const modelBuffer = createStorageBuffer(
    //   "modelBuffer",
    //   4 * 4 * 4 * NUM,
    //   device
    // );

    // const projectionBuffer = createUniformBuffer(
    //   "projectionBuffer",
    //   4 * 4 * 4,
    //   device
    // );

    // const colorBuffer = createStorageBuffer("colorBuffer", 4 * 4 * NUM, device);
    // const { pipeline } = await initPipline(device, format, {
    //   depthFormat,
    // });

    // const mvpBindingGroup = createBindingGroup(
    //   "mvpBindingGroup",
    //   [modelBuffer, projectionBuffer, colorBuffer],
    //   pipeline.getBindGroupLayout(0),
    //   device
    // );

    // const lightBuffer = createStorageBuffer("lightBuffer", 5 * 4, device);
    // const lightGroup = createBindingGroup(
    //   "lightGroup Group with matrix",
    //   [lightBuffer],
    //   pipeline.getBindGroupLayout(1),
    //   device
    // );

    // // Setup render outputs
    // // const ai = new Float32Array([0.1]);
    // const pl = new Float32Array([0, 0, 0, 1, 5]);
    // let n = 1,
    //   f = 1000,
    //   fov = 150,
    //   cx = 0,
    //   cz = 0;

    // // // create objects
    // // const scene: any[] = [];
    // const modelMatrixes = new Float32Array(NUM * 4 * 4);
    // const colors = new Float32Array(NUM * 4);

    // // const light = createPointLight(
    // //   lightPosition,
    // //   lightIntensity,
    // //   lightRadius
    // // ).array();
    // const cameraLookAt = vec4(0, 0, 1);

    // for (let i = 0; i < NUM; i++) {
    //   modelMatrixes.set(
    //     translate(Math.random() * 5 - 2, Math.random() * 5 - 2, 2).array(),
    //     i * 16
    //   );
    //   colors.set([Math.random(), Math.random(), Math.random(), 1], i * 4);

    //   // scene.push({ position, rotation, scale });
    // }
    // device.queue.writeBuffer(modelBuffer, 0, modelMatrixes);
    // device.queue.writeBuffer(colorBuffer, 0, colors);
    // // Render!
    // const frame = function () {
    //   // scene.push({ position, rotation, scale });
    //   device.queue.writeBuffer(lightBuffer, 0, pl);

    //   const cameraPosition = vec4(cx, 0, cz);
    //   const cameraUp = vec4(0, 1, 0);
    //   const lookAt = perspectiveCamera(cameraPosition, cameraLookAt, cameraUp);

    //   let projection = lookAt(n, f, fov).array();

    //   device.queue.writeBuffer(projectionBuffer, 0, projection);

    //   const commandEncoder = device.createCommandEncoder();

    //   const renderPass = commandEncoder.beginRenderPass({
    //     colorAttachments: [
    //       {
    //         view: context.getCurrentTexture().createView(),

    //         clearValue: { r: 0, g: 0, b: 0, a: 1 },
    //         loadOp: "clear",
    //         storeOp: "store",
    //       },
    //     ],
    //     depthStencilAttachment: {
    //       view: depthTexture.createView(),
    //       depthClearValue: 1,
    //       depthLoadOp: "clear",
    //       depthStoreOp: "store",
    //       stencilClearValue: 0,
    //       stencilLoadOp: "clear",
    //       stencilStoreOp: "store",
    //     },
    //   });

    //   renderPass.setPipeline(pipeline);
    //   renderPass.setBindGroup(0, mvpBindingGroup);
    //   renderPass.setBindGroup(1, lightGroup);

    //   renderPass.setVertexBuffer(0, boxBuffer.vertex);
    //   renderPass.setIndexBuffer(boxBuffer.index, "uint16");
    //   renderPass.drawIndexed(box.indexCount, NUM, 0, 0, 0);

    //   renderPass.end();

    //   device.queue.submit([commandEncoder.finish()]);
    // engine.start(() => {
    //   const scene = createScene(engine);

    // });
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

export default App;
