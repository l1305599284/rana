import { initDepthStencil, initGPU } from "./core";
import { createScene, Scene } from "./scene";

type EngineOptions = Partial<{
  antialias: boolean;
  preserveDrawingBuffer: boolean;
  stencil: boolean;
}>;

export class Engine {
  scene: Scene;
  constructor(private canvas: HTMLCanvasElement, options?: EngineOptions) {}
  createDefaultScene() {
    const scene = createScene(this);
    this.addScene(scene);
    return scene;
  }
  addScene(scene: Scene) {
    this.scene = scene;
  }
  loop(renderFunction: () => void) {
    (async () => {
      const { gpu, canvas, adapter, device, context, format } = await initGPU(
        this.canvas
      );
      const { depthFormat, depthTexture } = await initDepthStencil(
        device,
        this.canvas
      );

      const boxBuffer = {
        vertex: createVertexBuffer("box vertex", box.vertex.byteLength, device),
        index: createIndexBuffer("box index", box.index.byteLength, device),
      };

      const modelBuffer = createStorageBuffer(
        "modelBuffer",
        4 * 4 * 4 * NUM,
        device
      );

      const projectionBuffer = createUniformBuffer(
        "projectionBuffer",
        4 * 4 * 4,
        device
      );

      const colorBuffer = createStorageBuffer(
        "colorBuffer",
        4 * 4 * NUM,
        device
      );
      const { pipeline } = await initPipline(device, format, {
        depthFormat,
      });

      const mvpBindingGroup = createBindingGroup(
        "mvpBindingGroup",
        [modelBuffer, projectionBuffer, colorBuffer],
        pipeline.getBindGroupLayout(0),
        device
      );

      const lightBuffer = createStorageBuffer("lightBuffer", 5 * 4, device);
      const lightGroup = createBindingGroup(
        "lightGroup Group with matrix",
        [lightBuffer],
        pipeline.getBindGroupLayout(1),
        device
      );

      // Setup render outputs
      // const ai = new Float32Array([0.1]);
      const pl = new Float32Array([0, 0, 0, 1, 5]);
      let n = 1,
        f = 1000,
        fov = 150,
        cx = 0,
        cz = 0;

      // // create objects
      // const scene: any[] = [];
      const modelMatrixes = new Float32Array(NUM * 4 * 4);
      const colors = new Float32Array(NUM * 4);

      // const light = createPointLight(
      //   lightPosition,
      //   lightIntensity,
      //   lightRadius
      // ).array();
      const cameraLookAt = vec4(0, 0, 1);

      for (let i = 0; i < NUM; i++) {
        modelMatrixes.set(
          translate(Math.random() * 5 - 2, Math.random() * 5 - 2, 2).array(),
          i * 16
        );
        colors.set([Math.random(), Math.random(), Math.random(), 1], i * 4);

        // scene.push({ position, rotation, scale });
      }
      device.queue.writeBuffer(modelBuffer, 0, modelMatrixes);
      device.queue.writeBuffer(colorBuffer, 0, colors);
      const realRenderFunction = function () {
        renderFunction();
        requestAnimationFrame(renderFunction);
      };
      requestAnimationFrame(realRenderFunction);
    })();
  }
}

export function createEngine(
  canvas: HTMLCanvasElement,
  options?: EngineOptions
) {
  return new Engine(canvas, options);
}
