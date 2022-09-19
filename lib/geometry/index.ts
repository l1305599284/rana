import { FloatArray, IndicesArray, int } from "../types";

import * as box from "./box";

export class Geometry {
  constructor(
    public vertex: FloatArray,
    public index: IndicesArray,
    public vertexCount: int,
    public indexCount: int
  ) {}
}
export function createBoxGeometry() {
  return new Geometry(box.vertex, box.index, box.vertexCount, box.indexCount);
}
