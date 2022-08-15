import vertShaderCode from "./shaders/vert.wgsl?raw";
import fragShaderCode from "./shaders/frag.wgsl?raw";
import {
  createVertexBuffer,
  createUniformBuffer,
  createBindingGroup,
} from "./buffer";
import { mat4 } from "./matrix";
import { tl } from "./transform";
import { perspectiveCamera } from "./camera";
import { vec3, vec4 } from "./vector";
import { box, sphere } from "./meshes";
import { createShaderModule } from "./shaders/index";
import { createPointLight } from "./light";

const NUM = 2;

const initGPU = async (canvas: HTMLCanvasElement) => {
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
  return { gpu, canvas, adapter, device, context, format };
};

const initDepthStencil = async (
  device: GPUDevice,
  canvas: HTMLCanvasElement
) => {
  const depthFormat = <GPUTextureFormat>"depth24plus-stencil8";
  const depthTexture = device.createTexture({
    size: {
      width: canvas.width,
      height: canvas.height,
      depthOrArrayLayers: 1,
    },
    format: depthFormat,
    usage: GPUTextureUsage.RENDER_ATTACHMENT,
  });
  return { depthFormat, depthTexture };
};

const initPipline = async (
  device: GPUDevice,
  format: GPUTextureFormat,
  depthOp?: {
    depthFormat: GPUTextureFormat;
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
        arrayStride: 8 * 4, // 3 position 2 uv,
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
    layout: "auto",
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

export const render = async (canvas: HTMLCanvasElement) => {
  const { device, context, format } = await initGPU(canvas);
  const { depthFormat, depthTexture } = await initDepthStencil(device, canvas);
  const { pipeline } = await initPipline(device, format, {
    depthFormat,
  });
  const boxBuffer = {
    vertex: device.createBuffer({
      label: "GPUBuffer store vertex",
      size: box.vertex.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    }),
    index: device.createBuffer({
      label: "GPUBuffer store vertex index",
      size: box.index.byteLength,
      usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
    }),
  };
  const sphereBuffer = {
    vertex: device.createBuffer({
      label: "GPUBuffer store vertex",
      size: sphere.vertex.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    }),
    index: device.createBuffer({
      label: "GPUBuffer store vertex index",
      size: sphere.index.byteLength,
      usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
    }),
  };
  device.queue.writeBuffer(boxBuffer.vertex, 0, box.vertex);
  device.queue.writeBuffer(boxBuffer.index, 0, box.index);
  device.queue.writeBuffer(sphereBuffer.vertex, 0, sphere.vertex);
  device.queue.writeBuffer(sphereBuffer.index, 0, sphere.index);

  const vp = perspectiveCamera(
    vec4(0, 0, 0),
    vec4(0, 0, 1),
    vec4(0, 1, 0)
  )(1, 5);

  const m = tl(0, 0, 2);

  const mvp = vp.mul(m);
  mvp.transpose();

  const modelViewBuffer = createUniformBuffer(16 * 4, device);
  const projectionBuffer = createUniformBuffer(16 * 4, device);
  const colorBuffer = createUniformBuffer(16 * 4, device);
  const ambientBuffer = createUniformBuffer(4, device);
  const pointBuffer = createUniformBuffer(8 * 4, device);

  const mvpBindingGroup = createBindingGroup(
    [modelViewBuffer, projectionBuffer, colorBuffer],
    pipeline.getBindGroupLayout(0),
    device
  );
  const lightGroup = createBindingGroup(
    [ambientBuffer, pointBuffer],
    pipeline.getBindGroupLayout(1),
    device
  );

  const colorAttachments = <Iterable<GPURenderPassColorAttachment | null>>[
    {
      view: context.getCurrentTexture().createView(),
      clearValue: { r: 0, g: 0, b: 0, a: 1 },
      loadOp: "clear",
      storeOp: "store",
    },
  ];
  const depthStencilAttachment = <GPURenderPassDepthStencilAttachment>{
    view: depthTexture.createView(),
    depthClearValue: 1,
    depthLoadOp: "clear",
    depthStoreOp: "store",
    stencilClearValue: 0,
    stencilLoadOp: "clear",
    stencilStoreOp: "store",
  };
  const renderPassDescriptor = {
    colorAttachments,
    depthStencilAttachment,
  };

  // Setup render outputs
  const ambient = new Float32Array([0.01]);

  const lightPosition = vec3(0, 0, 0);
  let lightIntensity = 1;
  let lightRadius = 1;
  const l = createPointLight(lightPosition, lightIntensity, lightRadius);
  // Render!
  const frame = function () {
    const commandEncoder = device.createCommandEncoder();

    const renderPass = commandEncoder.beginRenderPass(renderPassDescriptor);

    renderPass.setPipeline(pipeline);

    device.queue.writeBuffer(ambientBuffer, 0, ambient);
    device.queue.writeBuffer(pointBuffer, 0, l.array());
    renderPass.setBindGroup(0, mvpBindingGroup);
    renderPass.setBindGroup(1, lightGroup);
    // set box vertex
    renderPass.setVertexBuffer(0, boxBuffer.vertex);
    renderPass.setIndexBuffer(boxBuffer.index, "uint16");
    renderPass.drawIndexed(box.indexCount, NUM / 2, 0, 0, 0);
    // set sphere vertex
    renderPass.setVertexBuffer(0, sphereBuffer.vertex);
    renderPass.setIndexBuffer(sphereBuffer.index, "uint16");
    renderPass.drawIndexed(sphere.indexCount, NUM / 2, 0, 0, NUM / 2);
    renderPass.end();

    device.queue.submit([commandEncoder.finish()]);
    requestAnimationFrame(frame);
  };

  return {
    start: () => {
      requestAnimationFrame(frame);
    },
  };
};

// 📈 Position Vertex Buffer Data
const positions = new Float32Array([
  1.0, -1.0, 0.0, -1.0, -1.0, 0.0, 0.0, 1.0, 0.0,
]);
// 🎨 Color Vertex Buffer Data
const colors = new Float32Array([
  1.0,
  0.0,
  0.0, // 🔴
  0.0,
  1.0,
  0.0, // 🟢
  0.0,
  0.0,
  1.0, // 🔵
]);

// 📇 Index Buffer Data
const indices = new Uint16Array([0, 1, 2]);

export class Renderer {
  // ⚙️ API Data Structures
  adapter: GPUAdapter;
  device: GPUDevice;
  queue: GPUQueue;

  // 🎞️ Frame Backings
  context: GPUCanvasContext;
  colorTexture: GPUTexture;
  colorTextureView: GPUTextureView;
  depthTexture: GPUTexture;
  depthTextureView: GPUTextureView;

  // 🔺 Resources
  positionBuffer: GPUBuffer;
  colorBuffer: GPUBuffer;
  indexBuffer: GPUBuffer;
  vertModule: GPUShaderModule;
  fragModule: GPUShaderModule;
  pipeline: GPURenderPipeline;

  commandEncoder: GPUCommandEncoder;
  passEncoder: GPURenderPassEncoder;

  constructor(public canvas: HTMLCanvasElement) {
    this.start();
  }

  // 🏎️ Start the rendering engine
  async start() {
    if (await this.initializeGPU()) {
      this.resizeBackings();
      await this.initializeResources();
      this.render();
    }
  }

  // 🌟 Initialize WebGPU
  async initializeGPU() {
    try {
      // 🏭 Entry to WebGPU
      const gpu: GPU = navigator.gpu;
      if (!gpu) {
        return false;
      }

      // 🔌 Physical Device Adapter
      this.adapter = await gpu.requestAdapter({
        powerPreference: "high-performance",
      });

      // 💻 Logical Device
      this.device = await this.adapter.requestDevice({
        requiredFeatures: [],
        requiredLimits: {},
      });

      // 📦 Queue
      this.queue = this.device.queue;
    } catch (e) {
      console.error(e);
      return false;
    }

    return true;
  }

  // 🍱 Initialize resources to render triangle (buffers, shaders, pipeline)
  async initializeResources() {
    // 🔺 Buffers
    const createBuffer = (arr: Float32Array | Uint16Array, usage: number) => {
      // 📏 Align to 4 bytes (thanks @chrimsonite)
      let desc = {
        size: (arr.byteLength + 3) & ~3,
        usage,
        mappedAtCreation: true,
      };
      let buffer = this.device.createBuffer(desc);
      const writeArray =
        arr instanceof Uint16Array
          ? new Uint16Array(buffer.getMappedRange())
          : new Float32Array(buffer.getMappedRange());
      writeArray.set(arr);
      buffer.unmap();
      return buffer;
    };

    this.positionBuffer = createBuffer(positions, GPUBufferUsage.VERTEX);
    this.colorBuffer = createBuffer(colors, GPUBufferUsage.VERTEX);
    this.indexBuffer = createBuffer(indices, GPUBufferUsage.INDEX);

    // 🖍️ Shaders
    const vsmDesc = {
      code: vertShaderCode,
    };
    this.vertModule = this.device.createShaderModule(vsmDesc);

    const fsmDesc = {
      code: fragShaderCode,
    };
    this.fragModule = this.device.createShaderModule(fsmDesc);

    // ⚗️ Graphics Pipeline

    // 🔣 Input Assembly
    const positionAttribDesc: GPUVertexAttribute = {
      shaderLocation: 0, // [[location(0)]]
      offset: 0,
      format: "float32x3",
    };
    const colorAttribDesc: GPUVertexAttribute = {
      shaderLocation: 1, // [[location(1)]]
      offset: 0,
      format: "float32x3",
    };
    const positionBufferDesc: GPUVertexBufferLayout = {
      attributes: [positionAttribDesc],
      arrayStride: 4 * 3, // sizeof(float) * 3
      stepMode: "vertex",
    };
    const colorBufferDesc: GPUVertexBufferLayout = {
      attributes: [colorAttribDesc],
      arrayStride: 4 * 3, // sizeof(float) * 3
      stepMode: "vertex",
    };

    // 🌑 Depth
    const depthStencil: GPUDepthStencilState = {
      depthWriteEnabled: true,
      depthCompare: "less",
      format: "depth24plus-stencil8",
    };

    // 🦄 Uniform Data
    const pipelineLayoutDesc = { bindGroupLayouts: [] };
    const layout = this.device.createPipelineLayout(pipelineLayoutDesc);

    // 🎭 Shader Stages
    const vertex: GPUVertexState = {
      module: this.vertModule,
      entryPoint: "main",
      buffers: [positionBufferDesc, colorBufferDesc],
    };

    // 🌀 Color/Blend State
    const colorState: GPUColorTargetState = {
      format: "bgra8unorm",
    };

    const fragment: GPUFragmentState = {
      module: this.fragModule,
      entryPoint: "main",
      targets: [colorState],
    };

    // 🟨 Rasterization
    const primitive: GPUPrimitiveState = {
      frontFace: "cw",
      cullMode: "back",
      topology: "triangle-list",
    };

    const pipelineDesc: GPURenderPipelineDescriptor = {
      layout,
      vertex,
      fragment,
      primitive,
      depthStencil,
    };

    this.pipeline = this.device.createRenderPipeline(pipelineDesc);
  }

  // ↙️ Resize swapchain, frame buffer attachments
  resizeBackings() {
    // ⛓️ Swapchain
    if (!this.context) {
      this.context = this.canvas.getContext("webgpu");
      const canvasConfig: GPUCanvasConfiguration = {
        device: this.device,
        format: "bgra8unorm",
        usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC,
        alphaMode: "opaque",
      };
      this.context.configure(canvasConfig);
    }

    const depthTextureDesc: GPUTextureDescriptor = {
      size: [this.canvas.width, this.canvas.height, 1],
      dimension: "2d",
      format: "depth24plus-stencil8",
      usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC,
    };

    this.depthTexture = this.device.createTexture(depthTextureDesc);
    this.depthTextureView = this.depthTexture.createView();
  }

  // ✍️ Write commands to send to the GPU
  encodeCommands() {
    let colorAttachment: GPURenderPassColorAttachment = {
      view: this.colorTextureView,
      clearValue: { r: 0, g: 0, b: 0, a: 1 },
      loadOp: "clear",
      storeOp: "store",
    };

    const depthAttachment: GPURenderPassDepthStencilAttachment = {
      view: this.depthTextureView,
      depthClearValue: 1,
      depthLoadOp: "clear",
      depthStoreOp: "store",
      stencilClearValue: 0,
      stencilLoadOp: "clear",
      stencilStoreOp: "store",
    };

    const renderPassDesc: GPURenderPassDescriptor = {
      colorAttachments: [colorAttachment],
      depthStencilAttachment: depthAttachment,
    };

    this.commandEncoder = this.device.createCommandEncoder();

    // 🖌️ Encode drawing commands
    this.passEncoder = this.commandEncoder.beginRenderPass(renderPassDesc);
    this.passEncoder.setPipeline(this.pipeline);
    this.passEncoder.setViewport(
      0,
      0,
      this.canvas.width,
      this.canvas.height,
      0,
      1
    );
    this.passEncoder.setScissorRect(
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );
    this.passEncoder.setVertexBuffer(0, this.positionBuffer);
    this.passEncoder.setVertexBuffer(1, this.colorBuffer);
    this.passEncoder.setIndexBuffer(this.indexBuffer, "uint16");
    this.passEncoder.drawIndexed(3, 1);
    this.passEncoder.end();

    this.queue.submit([this.commandEncoder.finish()]);
  }

  render = () => {
    // ⏭ Acquire next image from context
    this.colorTexture = this.context.getCurrentTexture();
    this.colorTextureView = this.colorTexture.createView();

    // 📦 Write and submit commands to queue
    this.encodeCommands();

    // ➿ Refresh canvas
    requestAnimationFrame(this.render);
  };
}
