import { initDepthStencil, initGPU } from "./core";

type EngineOptions = Partial<{
  antialias: boolean;
  preserveDrawingBuffer: boolean;
  stencil: boolean;
}>;

export class Engine {
  // ⚙️ API Data Structures

  constructor(private canvas: HTMLCanvasElement, options?: EngineOptions) {}

  start(renderFunction: () => void) {
    (async () => {
      const { gpu, canvas, adapter, device, context, format } = await initGPU(
        this.canvas
      );
      const { depthFormat, depthTexture } = await initDepthStencil(
        device,
        this.canvas
      );

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
