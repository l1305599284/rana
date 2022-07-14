import vertexShaderCode from "./shaders/test.vert.wgsl?raw";
import vertShaderCode from "./shaders/triangle.vert.wgsl?raw";
import fragShaderCode from "./shaders/triangle.frag.wgsl?raw";
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
  if (!device) {
    console.error("Failed to get GPU device.");
    return;
  }

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
  const shaderModule = device.createShaderModule({ code: vertexShaderCode });
  // This API is only available in Chrome right now
  if (shaderModule.compilationInfo) {
    const compilationInfo = await shaderModule.compilationInfo();
    if (compilationInfo.messages.length > 0) {
      let hadError = false;
      console.log("Shader compilation log:");
      for (let i = 0; i < compilationInfo.messages.length; ++i) {
        const msg = compilationInfo.messages[i];
        console.log(`${msg.lineNum}:${msg.linePos} - ${msg.message}`);
        hadError = hadError || msg.type == "error";
      }
      if (hadError) {
        console.log("Shader failed to compile");
        return;
      }
    }
  }
  // Specify vertex data
  // Allocate room for the vertex data: 3 vertices, each with 2 float4's

  const dataBuf = device.createBuffer({
    size: 3 * 2 * 4 * 4,
    usage: GPUBufferUsage.VERTEX,
    mappedAtCreation: true,
  });

  // Interleaved positions and colors
  new Float32Array(dataBuf.getMappedRange()).set([
    1,
    -1,
    0,
    1, // position
    1,
    0,
    0,
    1, // color
    -1,
    -1,
    0,
    1, // position
    0,
    1,
    0,
    1, // color
    0,
    1,
    0,
    1, // position
    0,
    0,
    1,
    1, // color
  ]);
  dataBuf.unmap();

  // Vertex attribute state and shader stage
  const vertexState = {
    // Shader stage info
    module: shaderModule,
    entryPoint: "vertex_main",
    // Vertex buffer info
    buffers: [
      {
        arrayStride: 2 * 4 * 4,
        attributes: [
          { format: "float32x4", offset: 0, shaderLocation: 0 },
          { format: "float32x4", offset: 4 * 4, shaderLocation: 1 },
        ],
      },
    ],
  };

  // Setup render outputs
  const swapChainFormat = "bgra8unorm";
  context.configure({
    device: device,
    format: swapChainFormat,
    usage: GPUTextureUsage.RENDER_ATTACHMENT,
  });
  const depthFormat = "depth24plus-stencil8";
  const depthTexture = device.createTexture({
    size: {
      width: canvas.width,
      height: canvas.height,
      depth: 1,
    } as any,
    format: depthFormat,
    usage: GPUTextureUsage.RENDER_ATTACHMENT,
  });
  const fragmentState = {
    // Shader info
    module: shaderModule,
    entryPoint: "fragment_main",
    // Output render target info
    targets: [{ format: swapChainFormat }],
  };

  // Create render pipeline
  const layout = device.createPipelineLayout({ bindGroupLayouts: [] });

  const renderPipeline = device.createRenderPipeline({
    layout: layout,
    vertex: vertexState,
    fragment: fragmentState,
    depthStencil: {
      format: depthFormat,
      depthWriteEnabled: true,
      depthCompare: "less",
    },
  } as any);
  const renderPassDesc = {
    colorAttachments: [{ view: undefined, loadValue: [0.3, 0.3, 0.3, 1] }],
    depthStencilAttachment: {
      view: depthTexture.createView(),
      depthLoadValue: 1.0,
      depthStoreOp: "store",
      stencilLoadValue: 0,
      stencilStoreOp: "store",
    },
  };
  // Render!
  const frame = function () {
    renderPassDesc.colorAttachments[0].view = context
      .getCurrentTexture()
      .createView();

    var commandEncoder = device.createCommandEncoder();

    var renderPass = commandEncoder.beginRenderPass(renderPassDesc as any);

    renderPass.setPipeline(renderPipeline);
    renderPass.setVertexBuffer(0, dataBuf);
    renderPass.draw(3, 1, 0, 0);

    renderPass.end();
    device.queue.submit([commandEncoder.finish()]);
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
  // ....
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

  constructor(public canvas: HTMLCanvasElement) {}

  // 🏎️ Start the rendering engine
  async start() {
    if (await this.initializeAPI()) {
      this.resizeBackings();
      await this.initializeResources();
      this.render();
    }
  }

  // 🌟 Initialize WebGPU
  async initializeAPI(): Promise<boolean> {
    try {
      // 🏭 Entry to WebGPU
      const entry: GPU = navigator.gpu;
      if (!entry) {
        return false;
      }

      // 🔌 Physical Device Adapter
      this.adapter = await entry.requestAdapter();

      // 💻 Logical Device
      this.device = await this.adapter.requestDevice();

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
      cullMode: "none",
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
