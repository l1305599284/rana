import { Camera } from "./camera";
import { Engine } from "./engine";
import { Light } from "./light";
import { Mesh } from "./meshes/mesh";

type SceneOptions = {};

export class Scene {
  camera?: Camera;
  light?: Light;
  meshes?: Mesh[];
  constructor(public engine: Engine, options?: SceneOptions) {
    engine.addScene(this);
    if (options) {
    }
  }

  render() {
    device.queue.writeBuffer(boxBuffer.vertex, 0, box.vertex);
    device.queue.writeBuffer(boxBuffer.index, 0, box.index);
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

    renderPass.setVertexBuffer(0, boxBuffer.vertex);
    renderPass.setIndexBuffer(boxBuffer.index, "uint16");
    renderPass.drawIndexed(box.indexCount, NUM, 0, 0, 0);

    renderPass.end();

    device.queue.submit([commandEncoder.finish()]);
  }

  createSceneUniformBuffer() {}
  addMesh() {}
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
