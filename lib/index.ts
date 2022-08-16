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
import { tl, transform } from "./transform";
import { perspectiveCamera } from "./camera";
import { vec3, vec4 } from "./vector";
import { triangle, box, sphere } from "./meshes";
import { createShaderModule } from "./shaders/index";
import { createPointLight } from "./light";

const NUM = 5;

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
    vertex: createVertexBuffer("box vertex", box.vertex.byteLength, device),
    index: createIndexBuffer("box index", box.index.byteLength, device),
  };
  // const boxBuffer = {
  //   vertex: createVertexBuffer(box.vertex.byteLength, device),
  //   index: createIndexBuffer(box.index.byteLength, device),
  // };
  // const sphereBuffer = {
  //   vertex: createVertexBuffer(sphere.vertex.byteLength, device),
  //   index: createIndexBuffer(sphere.index.byteLength, device),
  // };
  // device.queue.writeBuffer(boxBuffer.vertex, 0, box.vertex);
  // device.queue.writeBuffer(boxBuffer.index, 0, box.index);
  // device.queue.writeBuffer(sphereBuffer.vertex, 0, sphere.vertex);
  // device.queue.writeBuffer(sphereBuffer.index, 0, sphere.index);
  device.queue.writeBuffer(boxBuffer.vertex, 0, box.vertex);
  device.queue.writeBuffer(boxBuffer.index, 0, box.index);

  const modelBuffer = createStorageBuffer("modelBuffer", 16 * 4 * NUM, device);

  const projectionBuffer = createUniformBuffer(
    "projectionBuffer",
    16 * 4,
    device
  );

  const colorBuffer = createStorageBuffer("colorBuffer", 4 * 4 * NUM, device);

  const mvpBindingGroup = createBindingGroup(
    "mvpBindingGroup",
    [modelBuffer, projectionBuffer, colorBuffer],
    pipeline.getBindGroupLayout(0),
    device
  );

  // const ambientBuffer = createUniformBuffer(4, device);
  // const lightBuffer = createUniformBuffer(8 * 4, device);
  // const lightGroup = createBindingGroup(
  //   "lightGroup Group with matrix",
  //   [ambientBuffer, lightBuffer],
  //   pipeline.getBindGroupLayout(1),
  //   device
  // );

  // Setup render outputs
  // const ambient = new Float32Array([0.01]);

  // const lightPosition = vec3(0, 0, 0);
  // let lightIntensity = 1;
  // let lightRadius = 1;
  // // create objects
  // const scene: any[] = [];
  const modelMatrixes = new Float32Array(NUM * 4 * 4);
  const colors = new Float32Array(NUM * 4);

  const cameraPosition = vec4(0, 0, 0);
  const cameraLookAt = vec4(0, 0, 1);
  const cameraUp = vec4(0, 1, 0);
  const vp = perspectiveCamera(cameraPosition, cameraLookAt, cameraUp)(1, 5);
  device.queue.writeBuffer(projectionBuffer, 0, vp.array());

  for (let i = 0; i < NUM; i++) {
    modelMatrixes.set(tl(Math.random(), Math.random(), 2).array(), i * 4 * 4);

    colors.set([Math.random(), Math.random(), Math.random(), 1], i * 4);
    // scene.push({ position, rotation, scale });
  }

  // const light = createPointLight(
  //   lightPosition,
  //   lightIntensity,
  //   lightRadius
  // ).array();
  console.log("colors", colors);

  device.queue.writeBuffer(colorBuffer, 0, colors);
  device.queue.writeBuffer(modelBuffer, 0, modelMatrixes);

  // Render!
  const frame = function () {
    // light[3] = lightIntensity;
    // light[4] = lightRadius;

    // device.queue.writeBuffer(ambientBuffer, 0, ambient);
    // device.queue.writeBuffer(lightBuffer, 0, light);

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
    // renderPass.setBindGroup(1, lightGroup);
    // set box vertex
    renderPass.setVertexBuffer(0, boxBuffer.vertex);
    renderPass.setIndexBuffer(boxBuffer.index, "uint16");
    renderPass.drawIndexed(box.indexCount, NUM, 0, 0, 0);
    // set sphere vertex
    // renderPass.setVertexBuffer(0, sphereBuffer.vertex);
    // renderPass.setIndexBuffer(sphereBuffer.index, "uint16");
    // renderPass.drawIndexed(sphere.indexCount, NUM / 2, 0, 0, NUM / 2);
    renderPass.end();

    device.queue.submit([commandEncoder.finish()]);
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
  // UI
  // document.querySelector("#ambient")?.addEventListener("input", (e: Event) => {
  //   ambient[0] = +(e.target as HTMLInputElement).value;
  // });
  // document.querySelector("#point")?.addEventListener("input", (e: Event) => {
  //   lightIntensity = +(e.target as HTMLInputElement).value;
  // });
  // document.querySelector("#radius")?.addEventListener("input", (e: Event) => {
  //   lightRadius = +(e.target as HTMLInputElement).value;
  // });
};
