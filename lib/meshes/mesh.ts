import { Color, color3, color4 } from "../color";
import { Geometry } from "../geometry/index";
import { Material } from "../material";
import { Matrix } from "../matrix";
import { Scene } from "../scene";
import { translate } from "../transform";

export class Mesh {
  transform: Matrix;
  material: Material;
  geometry: Geometry;
  color: Color;
  constructor(public name: string, scene: Scene) {
    this.transform = translate(0, 0, 2);
    this.color = color4(Math.random(), Math.random(), Math.random(), 1);
    scene.addMesh(this);
  }
}
