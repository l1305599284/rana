import {
  createBindingGroup,
  createIndexBuffer,
  createStorageBuffer,
  createUniformBuffer,
  createVertexBuffer,
} from "./buffer";
import { Camera } from "./camera";
import { initPipline } from "./core";
import { Engine } from "./engine";
import { Light } from "./light";
import { Matrix } from "./matrix";
import { Mesh } from "./meshes/mesh";
import { translate } from "./transform";
type MeshBuffer = {
  vertex: GPUBuffer;
  index: GPUBuffer;
};
type SceneOptions = {};
const pl = new Float32Array([0, 0, 0, 1, 5]);
export class Scene {
  camera?: Camera;
  light?: Light;
  meshes?: Mesh[]=[];
  pipeline: GPURenderPipeline;
  mvpBindingGroup: GPUBindGroup;
  lightBindingGroup: GPUBindGroup;
  transforms: Float32Array;
  colors: Float32Array;
  lightBuffer: GPUBuffer;
  meshBuffers: MeshBuffer[];
  transformBuffer: GPUBuffer;
  projectionBuffer: GPUBuffer;
  colorBuffer: GPUBuffer;
  viewProjectionMatrix: Matrix;
  constructor(public engine: Engine, options?: SceneOptions) {
    engine.addScene(this);
    if (options) {
    }
  }

  getMeshesCount() {
    return this.meshes.length;
  }

  async init() {
    const { context, queue, device, format, depthFormat } = this.engine;

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
    console.log(this.meshBuffers);
    
    
    
    this.transformBuffer = createStorageBuffer(
      "modelBuffer",
      16 * 4 * this.getMeshesCount(),
      device
    );

    this.projectionBuffer = createUniformBuffer(
      "projectionBuffer",
      16 * 4,
      device
    );

      
    this.colorBuffer = createStorageBuffer(
      "colorBuffer",
      4 * 4 * this.getMeshesCount(),
      device
    );

    this.lightBuffer = createStorageBuffer("lightBuffer", 5 * 4, device);

    const { pipeline } = await initPipline(device, format, {
      depthFormat,
    });

    this.pipeline = pipeline;

    this.mvpBindingGroup = createBindingGroup(
      "mvpBindingGroup",
      [this.transformBuffer, this.projectionBuffer, this.colorBuffer],
      pipeline.getBindGroupLayout(0),
      device
    );

    this.lightBindingGroup = createBindingGroup(
      "lightGroup Group with matrix",
      [this.lightBuffer],
      pipeline.getBindGroupLayout(1),
      device
    );

    this.viewProjectionMatrix = this.camera.getViewProjectionMatrix();
    this.transforms = new Float32Array(this.getMeshesCount() * 16);
    this.colors = new Float32Array(this.getMeshesCount() * 4);

    this.meshes.map((mesh, i) => {
      this.transforms.set(translate(Math.random() * 5 - 2, Math.random() * 5 - 2, 2).array(), i * 16);
      this.colors.set(mesh.color.array(), i * 4);
    }); 
    
    queue.writeBuffer(this.transformBuffer, 0, this.transforms);
    queue.writeBuffer(this.colorBuffer, 0, this.colors);
    this.meshBuffers.map((buffer, i) => {

        queue.writeBuffer(buffer.vertex, 0,  this.meshes[i].geometry.vertex);
      queue.writeBuffer(buffer.index, 0, this.meshes[i].geometry.index);
 
      
    });
    queue.writeBuffer(this.lightBuffer, 0, pl);
    queue.writeBuffer(
      this.projectionBuffer,
      0,
      this.viewProjectionMatrix.array()
    );
  }
  render() {
    // write datas to buffers
    const { queue, device, context, depthTexture } = this.engine;
    

    const commandEncoder = device.createCommandEncoder();

    const colorAttachment: GPURenderPassColorAttachment = {
      view: context.getCurrentTexture().createView(),
      clearValue: { r: 0, g: 0, b: 0, a: 1 },
      loadOp: "clear",
      storeOp: "store",
    };

    const depthAttachment: GPURenderPassDepthStencilAttachment = {
      view: depthTexture.createView(),
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

    const passEncoder = commandEncoder.beginRenderPass(renderPassDesc);

    passEncoder.setPipeline(this.pipeline);
 
    // setBindGroups
    passEncoder.setBindGroup(0, this.mvpBindingGroup);
    passEncoder.setBindGroup(1, this.lightBindingGroup);

    this.meshBuffers.map((buffer, i) => {
      passEncoder.setVertexBuffer(0, buffer.vertex);
      passEncoder.setIndexBuffer(buffer.index, "uint16");
      passEncoder.drawIndexed(this.meshes[i].geometry.indexCount, 1, 0, 0, 0);
    });
debugger
    passEncoder.end();

    queue.submit([commandEncoder.finish()]);
  }

  createSceneUniformBuffer() {}
  addMesh(mesh: Mesh) {

    this.meshes.push(mesh);
  }
  removeMesh() {}

  addLight(light: Light) {
    this.light = light;
  }

  addCamera(camera: Camera) {
    this.camera = camera;
  }
  removeLight() {}
  removeCamera() {}
  addMaterial() {}
  removeMaterial() {}

  removeTexture() {}
  addTexture() {}

  addGeometry() {}
  removeGeometry() {}

  onPointer() {}
}

export function createScene(engine: Engine, options?: SceneOptions) {
  const scene = new Scene(engine, options);
  return scene;
}
