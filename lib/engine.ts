import { initDepthStencil, initGPU } from "./core";
import { createScene, Scene } from "./scene";

type EngineOptions = Partial<{
  antialias: boolean;
  preserveDrawingBuffer: boolean;
  stencil: boolean;
}>;

export class Engine {
  scene: Scene;
  device: GPUDevice;
  context: GPUCanvasContext;
  format: GPUTextureFormat;
  depthTexture: GPUTexture;
  queue: GPUQueue;
  depthFormat: GPUTextureFormat;
  constructor(private canvas: HTMLCanvasElement, options?: EngineOptions) {}
  createDefaultScene() {
    const scene = createScene(this);
    this.addScene(scene);
    return scene;
  }

  addScene(scene: Scene) {
    this.scene = scene;
  }

  async init() {
    const { gpu, adapter, device, context, format } = await initGPU(
      this.canvas
    );

    this.device = device;
    this.queue = device.queue;
    this.context = context;
    this.format = format;
    const { depthFormat, depthTexture } = await initDepthStencil(
      this.device,
      this.canvas
    );
    this.depthFormat = depthFormat;
    this.depthTexture = depthTexture;
  }

  loop(renderFunction: () => void) {
    (async () => {
      await this.init();
      await this.scene.init();

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
