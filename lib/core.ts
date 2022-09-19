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
  const format = gpu?.getPreferredCanvasFormat();
  const size = {
    width: canvas.width,
    height: canvas.height,
  };
  context.configure({ size, device, format, alphaMode: "opaque" });
  return { gpu, adapter, device, context, format, size };
};

export const initDepthStencil = async (
  device: GPUDevice,
  canvas: HTMLCanvasElement
) => {
  const depthFormat = <GPUTextureFormat>"depth24plus-stencil8";
  const depthTexture = device.createTexture({
    size: {
      width: canvas.width,
      height: canvas.height,
    },

    format: depthFormat,
    usage: GPUTextureUsage.RENDER_ATTACHMENT,
  });
  return { depthFormat, depthTexture };
};

export const initPipline = async (
  device: GPUDevice,
  format: GPUTextureFormat,
  depthOp?: {
    layout?: GPUPipelineLayout;
    depthFormat?: GPUTextureFormat;
  }
) => {
  const vsm = await createShaderModule(vertShaderCode, device);
  const fsm = await createShaderModule(fragShaderCode, device);
  // Vertex attribute state and shader stage
  const vertexState = {
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

  const fragmentState = {
    module: fsm,
    entryPoint: "main",
    targets: [
      {
        format: format,
      },
    ],
  };

  const pipeline = await device.createRenderPipelineAsync(<
    GPURenderPipelineDescriptor
  >{
    label: "Basic Pipline",
    layout: depthOp.layout || "auto",
    vertex: vertexState,
    fragment: fragmentState,
    depthStencil: depthOp && {
      format: depthOp.depthFormat,
      depthWriteEnabled: true,
      depthCompare: "less",
    },
    primitive: {
      topology: "triangle-list",
      frontFace: "cw",
      cullMode: "back",
    },
  });

  return { pipeline };
};
