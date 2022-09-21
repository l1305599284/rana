import { createSphereGeometry } from "../geometry/index";
import { Scene } from "../scene";
import { translate } from "../transform";
import { int } from "../types";
import { Mesh } from "./index";
type SphereOptions = {
  width: int;
  height: int;
};

const defaulSphereOptions = {};
class SphereMesh extends Mesh {
  constructor(name: string, scene: Scene, options?: SphereOptions) {
    super(name, scene);
    this.geometry = createSphereGeometry();
    for (const key in options) {
      if (Object.prototype.hasOwnProperty.call(defaulSphereOptions, key)) {
        this[key] = options[key];
      } else this[key] = defaulSphereOptions[key];
    }
  }
}

export function createSphere(
  name: string,
  scene: Scene,
  options?: SphereOptions
) {
  return new SphereMesh(name, scene, options);
}
