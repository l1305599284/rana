import { DType, mat4 } from "./matrix";

export class Vector {
  data: Float32Array;
  ndim: number = 4;
  dtype: DType = "f32";
  byteLength: number;
  constructor(
    x: number,
    y: number,
    z: number = 0,
    w: number = 1,
    dtype: DType = "f32"
  ) {
    if (dtype == "f32") this.data = new Float32Array([x, y, z, w]);
    this.byteLength = this.data.byteLength;
  }
  set(data: number[]) {
    if (this.dtype == "f32") this.data = new Float32Array(data);
  }
  equils(v: Vector) {
    let e = false;
    if (v.byteLength == this.byteLength) {
      if (this.data.toString() == v.data.toString()) e = true;
    }
    return e;
  }
  mul(v: Vector) {
    this.data[0] *= v.data[0];
    this.data[1] *= v.data[1];
    this.data[2] *= v.data[2];
    return this;
  }
  add(v: Vector) {
    this.data[0] += v.data[0];
    this.data[1] += v.data[1];
    this.data[2] += v.data[2];
    return this;
  }
  sub(v: Vector) {
    this.data[0] -= v.data[0];
    this.data[1] -= v.data[1];
    this.data[2] -= v.data[2];
    return this;
  }
  times(t: number) {
    this.data[0] *= t;
    this.data[1] *= t;
    this.data[2] *= t;
    return this;
  }
  norm() {
    const r = this.data[0] ** 2 + this.data[1] ** 2 + this.data[2] ** 2;
    return Math.sqrt(r);
  }
  normalizing() {
    const n = this.norm();

    this.data[0] /= n;
    this.data[1] /= n;
    this.data[2] /= n;
    return this;
  }
  dot(v: Vector) {
    return (
      this.data[0] * v.data[0] +
      this.data[1] * v.data[1] +
      this.data[2] * v.data[2]
    );
  }
  cross(v: Vector) {
    return vec4(
      this.data[1] * v.data[2] - this.data[2] * v.data[1],
      this.data[0] * v.data[2] - this.data[2] * v.data[0],
      this.data[0] * v.data[1] - this.data[1] * v.data[0],
      1
    );
  }
  cos(v: Vector) {
    return (this.dot(v) / this.norm()) * v.norm();
  }
  orthogonal(v: Vector) {
    return this.dot(v) == 0;
  }
}

export function vec2(x: number, y: number, dtype: DType = "f32") {
  return new Vector(x, y, 0, 1, dtype);
}
export function vec3(x: number, y: number, z: number, dtype: DType = "f32") {
  return new Vector(x, y, z, 1, dtype);
}
export function vec4(
  x: number,
  y: number,
  z: number,
  w: number = 1,
  dtype: DType = "f32"
) {
  return new Vector(x, y, z, w, dtype);
}
