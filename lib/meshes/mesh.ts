import { Geometry } from "../geometry/index";
import { Material } from "../material";
import { Matrix } from "../matrix";

export class Mesh {
  transform: Matrix;
  material: Material;
  getmetry: Geometry;
  constructor(public name: string, options: number) {
    if (options) {
    }
  }
}
