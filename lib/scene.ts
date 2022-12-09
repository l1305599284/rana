import {
  createBindingGroup,
  createIndexBuffer,
  createStorageBuffer,
  createUniformBuffer,
  createVertexBuffer,
} from "./buffer";
import { Camera, createPerspectiveCamera } from "./camera";
import { createPipline } from "./core";
import { Engine } from "./engine";
import { Light } from "./light";
import { Matrix } from "./matrix";
import { Mesh } from "./meshes/mesh";
import { translate } from "./transform";
import vertShaderCode from "./shaders/vert.wgsl?raw";
import fragShaderCode from "./shaders/frag.wgsl?raw";
import shadowShaderCode from "./shaders/shadow.wgsl?raw";
import { vec3 } from "./vector";
type MeshBuffer = {
  vertex: GPUBuffer;
  index: GPUBuffer;
};
type SceneOptions = {
  shadow: boolean
};
const defaultSceneOptions = {
  shadow: true
};

export class Scene {
  camera?: Camera;
  lights?: Light[] = [];
  meshes?: Mesh[] = [];
  renderPipeline: GPURenderPipeline;
  shadowPipeline: GPURenderPipeline;
  vertexShaderBindingGroup: GPUBindGroup;
  fragmentShaderBindingGroup: GPUBindGroup;
  shadowBindingGroup?: GPUBindGroup;
  transforms: Float32Array;
  colors: Float32Array;
  lightBuffer: GPUBuffer;
  meshBuffers: MeshBuffer[];
  modelViewBuffer: GPUBuffer;
  cameraProjectionBuffer: GPUBuffer;
  lightProjectionBuffer: GPUBuffer;
  colorBuffer: GPUBuffer;
  shadow: boolean
  viewProjectionMatrix: Matrix;
  constructor(public engine: Engine, options?: SceneOptions) {
    engine.addScene(this);
    if (options) {
      for (const key in defaultSceneOptions) {
        if (Object.prototype.hasOwnProperty.call(options, key)) {
          this[key] = options[key];
        } else this[key] = defaultSceneOptions[key];
      }
    }
  }

  getMeshesCount() {
    return this.meshes.length;
  }

  async init() {
    const { shadowDepthView, queue, primitive, depthStencil, device, format } = this.engine;



    this.meshBuffers = this.meshes.map((v) => ({
      vertex: createVertexBuffer(
        v.name + " vertex",
        v.geometry.vertex.byteLength,
        device
      ),
      index: createIndexBuffer(
        v.name + " index",
        v.geometry.index.byteLength,
        device
      ),
    }));




    this.modelViewBuffer = createStorageBuffer(
      "modelBuffer",
      16 * 4 * this.getMeshesCount(),
      device
    );

    this.cameraProjectionBuffer = createUniformBuffer(
      "cameraProjectionBuffer",
      4 * 4 * 4,
      device
    );


    this.colorBuffer = createStorageBuffer(
      "colorBuffer",
      4 * 4 * this.getMeshesCount(),
      device
    );

    this.lightBuffer = createStorageBuffer("lightBuffer", this.lights.length * 8 * 4, device);
    this.transforms = new Float32Array(this.getMeshesCount() * 16);
    this.colors = new Float32Array(this.getMeshesCount() * 4);



    this.meshBuffers.map((buffer, i) => {
      queue.writeBuffer(buffer.vertex, 0, this.meshes[i].geometry.vertex);
      queue.writeBuffer(buffer.index, 0, this.meshes[i].geometry.index);
    });

    if (this.shadow) {
      this.lightProjectionBuffer = createUniformBuffer(
        "lightProjectionBuffer",
        4 * 4 * 4,
        device
      );
      const { pipeline: shadowPipeline } = await createPipline('shadow pipline', device, {
        vertShaderCode: shadowShaderCode,
        primitive, depthStencil
      });
      this.shadowBindingGroup = createBindingGroup(
        "shadows",
        [this.modelViewBuffer, this.lightProjectionBuffer],
        shadowPipeline.getBindGroupLayout(0),
        device
      );

      this.shadowPipeline = shadowPipeline;
    }


    const { pipeline: renderPipeline } = await createPipline('render pipeline', device, {
      format,
      vertShaderCode: vertShaderCode,
      fragShaderCode: fragShaderCode,
      primitive, depthStencil
    });

    this.renderPipeline = renderPipeline;

    this.vertexShaderBindingGroup = createBindingGroup(
      "vertexShaderBindingGroup",
      [this.modelViewBuffer, this.cameraProjectionBuffer, this.lightProjectionBuffer, this.colorBuffer],
      renderPipeline.getBindGroupLayout(0),
      device
    );



    this.fragmentShaderBindingGroup = createBindingGroup(
      "lightGroup Group with matrix",
      [this.lightBuffer, shadowDepthView, device.createSampler({
        compare: 'less',
      })],
      renderPipeline.getBindGroupLayout(1),
      device
    );
  }
  render() {
    // write datas to buffers
    const { queue, device, context, renderDepthView, shadowDepthView } = this.engine;

    // transform 
    const cameraLight = createPerspectiveCamera(
      "camera",
      { target: vec3(0, 0, 1), position: vec3(0, 0, -1), up: vec3(0, 1, 0) },
      this
    );
    this.meshes.map((mesh, i) => {
      this.transforms.set(mesh.transform.array(), i * 16);
      this.colors.set(mesh.color.array(), i * 4);
    });

    queue.writeBuffer(this.modelViewBuffer, 0, this.transforms);
    queue.writeBuffer(this.colorBuffer, 0, this.colors);

    //  camera
    queue.writeBuffer(
      this.cameraProjectionBuffer,
      0,
      this.camera.getViewProjectionMatrix().array()
    );
    // light 

    if (this.lights.length > 0)
      for (let i = 0; i < this.lights.length; i++) {
        const light = this.lights[i];
        queue.writeBuffer(this.lightBuffer, i * 8 * 4, light.array());
        cameraLight.position = light.position
        queue.writeBuffer(this.lightProjectionBuffer, 0, cameraLight.getViewProjectionMatrix().array())
      }


    const commandEncoder = device.createCommandEncoder();



    if (this.shadow) {
      const shadowPassDescriptor: GPURenderPassDescriptor = {
        colorAttachments: [],
        depthStencilAttachment: {
          view: shadowDepthView,
          depthClearValue: 1.0,
          depthLoadOp: 'clear',
          depthStoreOp: 'store',
        }
      }
      const shadowPassEncoder = commandEncoder.beginRenderPass(shadowPassDescriptor)
      shadowPassEncoder.setPipeline(this.shadowPipeline);
      // setBindGroups
      shadowPassEncoder.setBindGroup(0, this.shadowBindingGroup);

      this.meshBuffers.map((buffer, i) => {

        shadowPassEncoder.setVertexBuffer(0, buffer.vertex);
        shadowPassEncoder.setIndexBuffer(buffer.index, "uint16");
        shadowPassEncoder.drawIndexed(this.meshes[i].geometry.indexCount, 1, 0, 0, i);
      });

      shadowPassEncoder.end();
    }


    const renderPassColorAttachment: GPURenderPassColorAttachment = {
      view: context.getCurrentTexture().createView(),
      clearValue: { r: 0, g: 0, b: 0, a: 1 },
      loadOp: "clear",
      storeOp: "store",
    };

    const renderPassDepthAttachment: GPURenderPassDepthStencilAttachment = {
      view: renderDepthView,
      depthClearValue: 1,
      depthLoadOp: "clear",
      depthStoreOp: "store",
      stencilClearValue: 0,
      stencilLoadOp: "clear",
      stencilStoreOp: "store",
    };

    const renderPassDesc: GPURenderPassDescriptor = {
      colorAttachments: [renderPassColorAttachment],
      depthStencilAttachment: renderPassDepthAttachment,
    };

    const renderpassEncoder = commandEncoder.beginRenderPass(renderPassDesc);

    renderpassEncoder.setPipeline(this.renderPipeline);

    // setBindGroups
    renderpassEncoder.setBindGroup(0, this.vertexShaderBindingGroup);

    renderpassEncoder.setBindGroup(1, this.fragmentShaderBindingGroup);

    this.meshBuffers.map((buffer, i) => {

      renderpassEncoder.setVertexBuffer(0, buffer.vertex);
      renderpassEncoder.setIndexBuffer(buffer.index, "uint16");
      renderpassEncoder.drawIndexed(this.meshes[i].geometry.indexCount, 1, 0, 0, i);
    });

    renderpassEncoder.end();

    queue.submit([commandEncoder.finish()]);
  }

  addMesh(mesh: Mesh) {
    this.meshes.push(mesh);
  }

  removeMesh(name: string) {
    this.meshes = this.meshes.filter((m) => m.name != name)
  }

  addLight(light: Light) {
    this.lights.push(light);
  }

  removeLight(name: string) {
    this.lights = this.lights.filter((l) => l.name != name)
  }

  setCamera(camera: Camera) {
    this.camera = camera;
  }

  addTexture() { }
  removeTexture() { }

  createSceneUniformBuffer() { }
  onLoad() {

  }
  onClick() {

  }
  onPointer() { }
}

export function createScene(engine: Engine, options?: SceneOptions) {
  const scene = new Scene(engine, options);
  return scene;
}
