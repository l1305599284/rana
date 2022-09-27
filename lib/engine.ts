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

  constructor(public canvas: HTMLCanvasElement, options?: EngineOptions) {}

  createDefaultScene() {
    const scene = createScene(this);
    this.addScene(scene);
    return scene;
  }

  addScene(scene: Scene) {
    this.scene = scene;
  }

  async init() {
    const { device, context, format } = await initGPU(this.canvas);
    const { depthFormat, depthTexture } = await initDepthStencil(
      device,
      this.canvas
    );

    this.device = device;
    this.queue = device.queue;
    this.context = context;
    this.format = format;
    this.depthFormat = depthFormat;
    this.depthTexture = depthTexture;
  }

  async loop(renderFunction: () => void) {
    function realRenderFunction() {
      renderFunction();
      // requestAnimationFrame(realRenderFunction);
    }

    await this.init();
    await this.scene.init();
    realRenderFunction();
    // requestAnimationFrame(realRenderFunction);
  }
}

export function createEngine(
  canvas: HTMLCanvasElement,
  options?: EngineOptions
) {
  return new Engine(canvas, options);
}
