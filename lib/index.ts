export const render = async () => {
  if (!("gpu" in navigator)) {
    console.error(
      "WebGPU is not supported. Enable chrome://flags/#enable-unsafe-webgpu flag."
    );
    return;
  }

  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) {
    console.error("Failed to get GPU adapter.");
    return;
  }
  const device = await adapter.requestDevice();

  // Get a context to display our rendered image on the canvas
  const canvas = <HTMLCanvasElement>document.getElementById("webgpu-canvas");
  if (!canvas) {
    console.error("canvas is not exist.");
  }
  const context = canvas.getContext("webgpu");
  if (!context) {
    console.error("webgpu is not supported.");
  }

  // Setup shader modules
  // ....

  // Upload vertex data
  // ....

  // Setup render outputs
  // ....

  // Create render pipeline
  // ....

  // Render!
  // ....
};
