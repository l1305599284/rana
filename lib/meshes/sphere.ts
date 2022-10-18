import { createSphereGeometry } from "../geometry/index";
import { Scene } from "../scene";
import { translate } from "../transform";
import { int } from "../types";
import { Mesh } from "./mesh";
type SphereOptions = {

};

const defaulSphereOptions = {

};
class SphereMesh extends Mesh {

  constructor(name: string, scene: Scene, options?: SphereOptions) {
    super(name, scene);
   
    for (const key in defaulSphereOptions) {
      if (Object.prototype.hasOwnProperty.call(options||{}, key)) {
        this[key] = options[key];
      } else this[key] = defaulSphereOptions[key];
    }

    this.geometry = createSphereGeometry();
  }
}

export function createSphere(name: string, scene: Scene, options?: SphereOptions) {
  return new SphereMesh(name, scene, options);
}
