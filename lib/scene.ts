import { createBindingGroup, createIndexBuffer, createStorageBuffer, createUniformBuffer, createVertexBuffer } from "./buffer";
import { Camera } from "./camera";
import { initPipline } from "./core";
import { Engine } from "./engine";
import { Light } from "./light";
import { Mesh } from "./meshes/mesh";
type MeshBuffer = {
  vertex: GPUBuffer,
  index:GPUBuffer
}
type SceneOptions = {};


export class Scene {
  camera?: Camera;
  light?: Light;
  meshes?: Mesh[];
  pipeline: GPURenderPipeline;
  mvpBindingGroup:GPUBindGroup
  lightBindingGroup:GPUBindGroup
  transforms: Float32Array;
  colors: Float32Array;
  lightBuffer: GPUBuffer;
  meshBuffers: MeshBuffer[];
  transformBuffer: GPUBuffer;
  projectionBuffer: GPUBuffer;
  colorBuffer: GPUBuffer;
  viewProjectionMatrix: import("j:/rana/lib/matrix").Matrix;
  constructor(public engine: Engine, options?: SceneOptions) {
    engine.addScene(this);
    if (options) {
    }
  }

  getMeshesCount(){
    return this.meshes.length
  }

  async init(){
 
    const { device,format,depthFormat } = this.engine
    const { pipeline } = await initPipline(device, format, {
      depthFormat,
    });
    this.meshBuffers = this.meshes.map(v=>({
      vertex: createVertexBuffer(v.name+" vertex", v.getmetry.vertex.byteLength, device),
      index: createIndexBuffer(v.name+"box index", v.getmetry.index.byteLength, device),
    }))

    this.transformBuffer = createStorageBuffer(
      "modelBuffer",
      4 * 4 * 4 * this.getMeshesCount(),
      device
    );

    this. projectionBuffer = createUniformBuffer(
      "projectionBuffer",
      4 * 4 * 4,
      device
    );

    this. colorBuffer = createStorageBuffer(
      "colorBuffer",
      4 * 4 * this.getMeshesCount(),
      device
    );
   
    this.mvpBindingGroup = createBindingGroup(
      "mvpBindingGroup",
      [this.transformBuffer, this.projectionBuffer, this.colorBuffer],
      pipeline.getBindGroupLayout(0),
      device
    );

    this.lightBuffer = createStorageBuffer("lightBuffer", 5 * 4, device);
    this.lightBindingGroup = createBindingGroup(
      "lightGroup Group with matrix",
      [this.lightBuffer],
      pipeline.getBindGroupLayout(1),
      device
    );

    this.viewProjectionMatrix = this.camera.getViewProjectionMatrix()
    this.transforms = new Float32Array(this.getMeshesCount() * 4 * 4);
    this.colors = new Float32Array(this.getMeshesCount() * 4);

     this.meshes.map((mesh,i)=>{
      this.transforms.set(mesh.transform.array(),i*mesh.transform.offset())
      this.colors.set([...mesh.color.array(), 1], i * 4)
     })

  

    this.pipeline = pipeline
  }
  render() {

    // write datas to buffers
    const {queue,device,context,depthTexture} = this.engine

    const pl = new Float32Array([0, 0, 0, 1, 5]);
    this.meshBuffers.map((buffer,i)=>{
      queue.writeBuffer(buffer.vertex, i, this.meshes[i].getmetry.vertex);
      queue.writeBuffer(buffer.index, i, this.meshes[i].getmetry.index);
    })
  
    queue.writeBuffer(this.transformBuffer, 0, this.transforms);
      queue.writeBuffer(this.colorBuffer, 0, this.colors);
    queue.writeBuffer(this.lightBuffer, 0, pl);

    let projection = this.viewProjectionMatrix.array();

    queue.writeBuffer(this.projectionBuffer, 0, projection);

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

    renderPass.setPipeline(this.pipeline);


    // setBindGroups
    renderPass.setBindGroup(0, this.mvpBindingGroup);
    renderPass.setBindGroup(1, this.lightBindingGroup);
    this.meshBuffers.map((buffer,i)=>{
      renderPass.setVertexBuffer(0, buffer.vertex);
      renderPass.setIndexBuffer(buffer.index, "uint16");
      renderPass.drawIndexed(this.meshes[i].getmetry.indexCount, 1, 0, 0, 0);
    })
 
    renderPass.end();

    queue.submit([commandEncoder.finish()]);
  }

  createSceneUniformBuffer() {}
  addMesh(mesh:Mesh) {
    this.meshes.push(mesh)
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
  return new Scene(engine, options);
}
