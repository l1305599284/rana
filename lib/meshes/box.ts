import { createBoxGeometry } from "../geometry/index";
import { Scene } from "../scene";
import { scale } from "../transform";
import { float } from "../types";
import { Mesh } from "./mesh";
type BoxOptions = {
  width: float;
  height: float;
  depth:float
};

const defaulBoxOptions = {
  width: 1,
  htight: 1,
  depth:1
};
class BoxMesh extends Mesh {
  width: float;
  height: float;
  depth:float
  constructor(name: string, scene: Scene, options?: BoxOptions) {
    super(name, scene);
    this.geometry = createBoxGeometry();
    // this.transform = scale(this.width,this.height,this.depth);
    for (const key in options) {
      if (Object.prototype.hasOwnProperty.call(defaulBoxOptions, key)) {
        this[key] = options[key];
      } else this[key] = defaulBoxOptions[key];
    }
  }
}

export function createBox(name: string, scene: Scene, options?: BoxOptions) {
  return new BoxMesh(name, scene, options);
}
