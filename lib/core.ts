import vertShaderCode from "./shaders/vert.wgsl?raw";
import fragShaderCode from "./shaders/frag.wgsl?raw";
import { createShaderModule } from "./shaders/index";

export const initGPU = async (canvas: HTMLCanvasElement) => {
  if (!("gpu" in navigator)) {
    console.error(
      "WebGPU is not supported. Enable chrome://flags/#enable-unsafe-webgpu flag."
    );
    return;
  }
  const gpu: GPU = navigator.gpu;

  const adapter = await gpu.requestAdapter({
    powerPreference: "high-performance",
  });

  if (!adapter) {
    console.error("Failed to get GPU adapter.");
    return;
  }

  const device = await adapter.requestDevice({
    requiredFeatures: [],
    requiredLimits: {},
  });
  if (!device) {
    console.error("Failed to get GPU device.");
    return;
  }

  // Get a context to display our rendered image on the canvas

  const context = canvas.getContext("webgpu");

  if (!context) {
    console.error("webgpu is not supported.");
  }
  const format = gpu.getPreferredCanvasFormat();
  context.configure({
    device,
    format,
    alphaMode: "opaque",
  });
  return { gpu, adapter, device, context, format };
};

export const initDepthStencil = async (
  device: GPUDevice,
  canvas: HTMLCanvasElement
) => {
  const depthFormat = <GPUTextureFormat>"depth24plus-stencil8";
  const depthTextureDesc: GPUTextureDescriptor = {
    size: {
      width: canvas.width,
      height: canvas.height,
    },
    format: depthFormat,
    usage: GPUTextureUsage.RENDER_ATTACHMENT,
  };

  const depthTexture = device.createTexture(depthTextureDesc);
  return { depthFormat, depthTexture };
};

export const createPipline = async (
  label:string,
  device: GPUDevice,
  options: {
    format?: GPUTextureFormat,
    vertShaderCode:string
    fragShaderCode?:string
    layout?: GPUPipelineLayout;
    primitive:GPUPrimitiveState;
    depthStencil: GPUDepthStencilState;
  }
) => {
  const vsm = vertShaderCode && await createShaderModule(vertShaderCode, device);
  const fsm = fragShaderCode && await createShaderModule(fragShaderCode, device);
  // Vertex attribute state and shader stage

  const vertexState =vsm && {
    module: vsm,
    entryPoint: "main",
    buffers: [
      {
        arrayStride: 8 * 4, // 3 position 3normol 2 uv,
        attributes: [
          {
            // position
            shaderLocation: 0,
            offset: 0,
            format: "float32x3",
          },
          {
            // normal
            shaderLocation: 1,
            offset: 3 * 4,
            format: "float32x3",
          },
          {
            // uv
            shaderLocation: 2,
            offset: 6 * 4,
            format: "float32x2",
          },
        ],
      },
    ],
  };

  const fragmentState = fsm && {
    module: fsm,
    entryPoint: "main",
    targets: [
      {
        format: options?.format,
      },
    ],
  };

  const pipeline = await device.createRenderPipelineAsync(<
    GPURenderPipelineDescriptor
  >{
    label,
    layout: options.layout || "auto",
    vertex: vertexState,
    fragment: fragmentState,
    primitive:options.primitive,
    depthStencil:options.depthStencil
  });

  return { pipeline };
};
