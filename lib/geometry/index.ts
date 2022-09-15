import { FloatArray, IndicesArray, int } from "../types";

export * as box from "./box";

export class Geometry {
  constructor(
    public vertex: FloatArray,
    public indices: IndicesArray,
    public vertexCount: int,
    public indexCount: int
  ) {}
}
