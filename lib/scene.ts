import { Camera } from "./camera";
import { Engine } from "./engine";
import { Light } from "./light";

type SceneOptions = {};
class SceneNode {
  render() {}
}
class Scene {
  camera?: Camera;
  light?: Light;
  nodes?: SceneNode[];
  constructor(public engine: Engine, options?: SceneOptions) {}
  if(options) {}
  render() {
    this.nodes.map((v) => v.render());
  }
}

export function createScene(engine: Engine, options?: SceneOptions) {
  return new Scene(engine, options);
}
