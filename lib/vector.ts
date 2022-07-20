import { DType } from "./matrix";

class Vector {
  data: Float32Array;
  dtype: DType = "f32";
  byteLength: number;
  constructor(x: number, y: number, z?: number, w?: number) {
    if (w) this.data = new Float32Array([x, y, z, w]);
    else if (z) this.data = new Float32Array([x, y, z]);
    else this.data = new Float32Array([x, y]);
    this.byteLength = this.data.byteLength;
  }
}

export function vec2(x: number, y: number) {
  return new Vector(x, y);
}
export function vec3(x: number, y: number, z: number) {
  return new Vector(x, y, z);
}
export function vec4(x: number, y: number, z: number, w: number) {
  return new Vector(x, y, z, w);
}
