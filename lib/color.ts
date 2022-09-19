import { DType, mat4 } from "./matrix";

export class Color {
  data: Float32Array;
  ndim: number = 4;
  dtype: DType = "f32";

  constructor(
    x: number,
    y: number,
    z: number = 0,
    w: number = 1,
    dtype: DType = "f32"
  ) {
    if (dtype == "f32") this.data = new Float32Array([x, y, z, w]);
  }
  offset() {
    return this.data.byteLength;
  }
  array() {
    return this.data;
  }
  set(data: number[]) {
    if (this.dtype == "f32") this.data = new Float32Array(data);
  }
  equils(v: Color) {
    let e = false;
    if (v.data.byteLength == this.data.byteLength) {
      if (this.data.toString() == v.data.toString()) e = true;
    }
    return e;
  }
  mul(v: Color) {
    this.data[0] *= v.data[0];
    this.data[1] *= v.data[1];
    this.data[2] *= v.data[2];
    return this;
  }
  add(v: Color) {
    this.data[0] += v.data[0];
    this.data[1] += v.data[1];
    this.data[2] += v.data[2];
    return this;
  }
  sub(v: Color) {
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
  dot(v: Color) {
    return (
      this.data[0] * v.data[0] +
      this.data[1] * v.data[1] +
      this.data[2] * v.data[2]
    );
  }
  cross(v: Color) {
    return color4(
      this.data[1] * v.data[2] - this.data[2] * v.data[1],
      this.data[0] * v.data[2] - this.data[2] * v.data[0],
      this.data[0] * v.data[1] - this.data[1] * v.data[0],
      1
    );
  }
  cos(v: Color) {
    return (this.dot(v) / this.norm()) * v.norm();
  }
  orthogonal(v: Color) {
    return this.dot(v) == 0;
  }
}

export function color2(x: number, y: number, dtype: DType = "f32") {
  return new Color(x, y, 0, 1, dtype);
}
export function color3(x: number, y: number, z: number, dtype: DType = "f32") {
  return new Color(x, y, z, 1, dtype);
}
export function color4(
  x: number,
  y: number,
  z: number,
  w: number = 1,
  dtype: DType = "f32"
) {
  return new Color(x, y, z, w, dtype);
}
