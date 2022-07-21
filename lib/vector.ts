import { DType } from "./matrix";

export class Vector {
  data: Float32Array;
  dtype: DType = "f32";
  byteLength: number;
  constructor(x: number, y: number, z: number = 0, w: number = 1) {
    this.data = new Float32Array([x, y, z, w]);

    this.byteLength = this.data.byteLength;
  }
  set(data: number[]) {
    this.data = new Float32Array(data);
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
