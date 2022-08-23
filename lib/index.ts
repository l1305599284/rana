import vertShaderCode from "./shaders/vert.wgsl?raw";
import fragShaderCode from "./shaders/frag.wgsl?raw";
import {
  createStorageBuffer,
  createUniformBuffer,
  createBindingGroup,
  createVertexBuffer,
  createIndexBuffer,
} from "./buffer";
import { mat4 } from "./matrix";
import { scale, tl, transform } from "./transform";
import { perspectiveCamera } from "./camera";
import { vec3, vec4 } from "./vector";
import { triangle, ground, box, sphere } from "./meshes";
import { createShaderModule } from "./shaders/index";
import { createPointLight } from "./light";

const NUM = 3;

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

export const render = async (canvas: HTMLCanvasElement) => {
  const { device, context, format } = await initGPU(canvas);
  const { depthFormat, depthTexture } = await initDepthStencil(device, canvas);

  const boxBuffer = {
    vertex: createVertexBuffer("box vertex", box.vertex.byteLength, device),
    index: createIndexBuffer("box index", box.index.byteLength, device),
  };
  // const groundBuffer = {
  //   vertex: createVertexBuffer(
  //     "ground index",
  //     ground.vertex.byteLength,
  //     device
  //   ),
  //   index: createIndexBuffer("ground index", ground.index.byteLength, device),
  // };
  // const triangleBuffer = {
  //   vertex: createVertexBuffer(
  //     "triangle index",
  //     triangle.vertex.byteLength,
  //     device
  //   ),
  //   index: createIndexBuffer(
  //     "triangle index",
  //     triangle.index.byteLength,
  //     device
  //   ),
  // };
  // const sphereBuffer = {
  //   vertex: createVertexBuffer(
  //     "sphereBuffer",
  //     sphere.vertex.byteLength,
  //     device
  //   ),
  //   index: createIndexBuffer("sphereBuffer", sphere.index.byteLength, device),
  // };
  // device.queue.writeBuffer(triangleBuffer.vertex, 0, triangle.vertex);
  // device.queue.writeBuffer(triangleBuffer.index, 0, triangle.index);

  // device.queue.writeBuffer(groundBuffer.vertex, 0, triangle.vertex);
  // device.queue.writeBuffer(groundBuffer.index, 0, triangle.index);

  // device.queue.writeBuffer(sphereBuffer.vertex, 0, sphere.vertex);
  // device.queue.writeBuffer(sphereBuffer.index, 0, sphere.index);
  device.queue.writeBuffer(boxBuffer.vertex, 0, box.vertex);
  device.queue.writeBuffer(boxBuffer.index, 0, box.index);

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

  const colorBuffer = createStorageBuffer("colorBuffer", 4 * 4  * NUM, device);
  const { pipeline } = await initPipline(device, format, {
    depthFormat,
  });

  // const bindGroupLayout = device.createBindGroupLayout({
  //   entries: [{
  //     binding: 0, visibility: GPUShaderStage.VERTEX, buffer: { type: "read-only-storage" }
  //   }, {
  //     binding: 1, visibility: GPUShaderStage.VERTEX, buffer: { type: "uniform" }
  //   }, {
  //     binding: 2, visibility: GPUShaderStage.VERTEX, buffer: { type: "read-only-storage" }
  //   }]
  // })
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
    modelMatrixes.set(tl(Math.random()*5-2, Math.random()*5-2, 2).array(),i*16);
    colors.set([Math.random(), Math.random(), Math.random(), 1
     ], i * 4);
      
    // scene.push({ position, rotation, scale });
  }
    device.queue.writeBuffer(modelBuffer, 0, modelMatrixes);
  device.queue.writeBuffer(colorBuffer, 0, colors);
  // Render!
  const frame = function () {

    // scene.push({ position, rotation, scale });
    device.queue.writeBuffer(lightBuffer, 0, pl);

    
    const cameraPosition = vec4(cx, 0, cz);
    const cameraUp = vec4(0, 1, 0);
    const lookAt = perspectiveCamera(cameraPosition, cameraLookAt, cameraUp);
    
    
    let projection = lookAt(n, f, fov).array();

    device.queue.writeBuffer(projectionBuffer, 0, projection);

    const commandEncoder = device.createCommandEncoder();

    const renderPass = commandEncoder.beginRenderPass({
      colorAttachments: [
        {
          view: context.getCurrentTexture().createView(),
          clearValue: { r: 0, g: 0, b: 0, a: 1 },
          loadOp: "clear",
          storeOp: "store",
        },
      ],
      depthStencilAttachment: {
        view: depthTexture.createView(),
        depthClearValue: 1,
        depthLoadOp: "clear",
        depthStoreOp: "store",
        stencilClearValue: 0,
        stencilLoadOp: "clear",
        stencilStoreOp: "store",
      },
    });

    renderPass.setPipeline(pipeline);
    renderPass.setBindGroup(0, mvpBindingGroup);
    renderPass.setBindGroup(1, lightGroup);

    // set traingle vertex
    // renderPass.setVertexBuffer(0, groundBuffer.vertex);
    // renderPass.setIndexBuffer(groundBuffer.index, "uint16");
    // renderPass.drawIndexed(ground.indexCount, NUM / 2, 0, 0, 0);
    // set traingle vertex
    // renderPass.setVertexBuffer(0, triangleBuffer.vertex);
    // renderPass.setIndexBuffer(triangleBuffer.index, "uint16");
    // renderPass.drawIndexed(triangle.indexCount, NUM, 0, 0, 0);
    // set box vertex
    renderPass.setVertexBuffer(0, boxBuffer.vertex);
    renderPass.setIndexBuffer(boxBuffer.index, "uint16");
    renderPass.drawIndexed(box.indexCount, NUM, 0, 0, 0);
    // set sphere vertex
    // renderPass.setVertexBuffer(0, sphereBuffer.vertex);
    // renderPass.setIndexBuffer(sphereBuffer.index, "uint16");
    // renderPass.drawIndexed(sphere.indexCount, NUM, 0, 0, NUM);
    renderPass.end();

    device.queue.submit([commandEncoder.finish()]);
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
  // UI

  // document.getElementById("ai")?.addEventListener("input", (e: any) => {
  //   ai[0] = e.target.value * 1;
  // });
  // document.getElementById("ac")?.addEventListener("input", (e: any) => {
  //   const color = e.target.value;
  //   const r = parseInt(color.substr(1, 2), 16);
  //   const g = parseInt(color.substr(3, 2), 16);
  //   const b = parseInt(color.substr(5, 2), 16);
  //   const c = vec3(r, g, b).normalizing().data;
  //   ac.set([c[0], c[1], c[2], 1]);
  // });
  document.getElementById("plx")?.addEventListener("input", (e: any) => {
    pl[0] = e.target.value * 1;
  });
  document.getElementById("ply")?.addEventListener("input", (e: any) => {
    pl[1] = e.target.value * 1;
  });
  document.getElementById("plz")?.addEventListener("input", (e: any) => {
    pl[2] = e.target.value * 1;
  });
  document.getElementById("pli")?.addEventListener("input", (e: any) => {
    pl[3] = e.target.value * 1;
  });
  document.getElementById("plr")?.addEventListener("input", (e: any) => {
    pl[4] = e.target.value * 1;
  });

  document.getElementById("cx")?.addEventListener("input", (e: any) => {
    cx = e.target.value * 1;
  });

  document.getElementById("cz")?.addEventListener("input", (e: any) => {
    console.log("cz",e.target.value);
    
    cz = e.target.value * 1;
  });

  document.getElementById("fov")?.addEventListener("input", (e: any) => {
    fov = +e.target.value * 1;
  });
  document.getElementById("n")?.addEventListener("input", (e: any) => {
    n = e.target.value * 1;
  });
  document.getElementById("f")?.addEventListener("input", (e: any) => {
    f = e.target.value * 1;
  });
};
