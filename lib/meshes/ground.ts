import { createGroundGeometry } from "../geometry/index";
import { Scene } from "../scene";
import { scale } from "../transform";
import { float } from "../types";
import { Mesh } from "./mesh";
type GroundOptions = {
  width: float;
  height: float;
 
};


const defaulGroundOptions = {
  width: 1,
  htight: 1,

};
class GroundMesh extends Mesh {
  width: float;
  height: float;

  constructor(name: string, scene: Scene, options?: GroundOptions) {
    super(name, scene);
    this.geometry = createGroundGeometry();
    this.transform = scale(this.width,this.height,0);
    for (const key in options) {
      if (Object.prototype.hasOwnProperty.call(defaulGroundOptions, key)) {
        this[key] = options[key];
      } else this[key] = defaulGroundOptions[key];
    }
  }
}

export function createGround(name: string, scene: Scene, options?: GroundOptions) {
  return new GroundMesh(name, scene, options);
}
