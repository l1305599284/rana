import { Engine } from "./engine";

type SceneOptions = {};

class Scene {
  constructor(public engine: Engine, options?: SceneOptions) {}

  render() {}
}

export function createScene(engine: Engine, options?: SceneOptions) {
  return new Scene(engine, options);
}
