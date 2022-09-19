import { Vector } from "./vector";
function createTypedArray(data: number[], type: DType = "f32") {
  switch (type) {
    case "f32":
    default:
      return new Float32Array(data);
  }
}
export type DType = "f32" | "f16" | "u16" | "u8" | "u32";
export class Matrix {
  private data: Float32Array;
  byteLength: number;
  size: number;
  constructor(data: number[] | number[][], public dType: DType = "f32") {
    this.data = createTypedArray(data.flat(), dType);
    this.byteLength = this.data.byteLength;
    this.size = this.data.length;
  }
  offset() {
    return this.data.byteLength;
  }
  array() {
    return this.data;
  }
  inverses() {}

  mul(target: Matrix) {
    const v1 =
      this.data[0] * target.data[0] +
      this.data[1] * target.data[4] +
      this.data[2] * target.data[8] +
      this.data[3] * target.data[12];
    const v2 =
      this.data[0] * target.data[1] +
      this.data[1] * target.data[5] +
      this.data[2] * target.data[9] +
      this.data[3] * target.data[13];
    const v3 =
      this.data[0] * target.data[2] +
      this.data[1] * target.data[6] +
      this.data[2] * target.data[10] +
      this.data[3] * target.data[14];
    const v4 =
      this.data[0] * target.data[3] +
      this.data[1] * target.data[7] +
      this.data[2] * target.data[11] +
      this.data[3] * target.data[15];
    const v5 =
      this.data[4] * target.data[0] +
      this.data[5] * target.data[4] +
      this.data[6] * target.data[8] +
      this.data[7] * target.data[12];
    const v6 =
      this.data[4] * target.data[1] +
      this.data[5] * target.data[5] +
      this.data[6] * target.data[9] +
      this.data[7] * target.data[13];
    const v7 =
      this.data[4] * target.data[2] +
      this.data[5] * target.data[6] +
      this.data[6] * target.data[10] +
      this.data[7] * target.data[14];
    const v8 =
      this.data[4] * target.data[3] +
      this.data[5] * target.data[7] +
      this.data[6] * target.data[11] +
      this.data[7] * target.data[15];
    const v9 =
      this.data[8] * target.data[0] +
      this.data[9] * target.data[4] +
      this.data[10] * target.data[8] +
      this.data[11] * target.data[12];
    const v10 =
      this.data[8] * target.data[1] +
      this.data[9] * target.data[5] +
      this.data[10] * target.data[9] +
      this.data[11] * target.data[13];
    const v11 =
      this.data[8] * target.data[2] +
      this.data[9] * target.data[6] +
      this.data[10] * target.data[10] +
      this.data[11] * target.data[14];
    const v12 =
      this.data[8] * target.data[3] +
      this.data[9] * target.data[7] +
      this.data[10] * target.data[11] +
      this.data[11] * target.data[15];

    const v13 =
      this.data[12] * target.data[0] +
      this.data[13] * target.data[4] +
      this.data[14] * target.data[8] +
      this.data[15] * target.data[12];
    const v14 =
      this.data[12] * target.data[1] +
      this.data[13] * target.data[5] +
      this.data[14] * target.data[9] +
      this.data[15] * target.data[13];
    const v15 =
      this.data[12] * target.data[2] +
      this.data[13] * target.data[6] +
      this.data[14] * target.data[10] +
      this.data[15] * target.data[14];
    const v16 =
      this.data[12] * target.data[3] +
      this.data[13] * target.data[7] +
      this.data[14] * target.data[11] +
      this.data[15] * target.data[15];
    const result = [
      v1,
      v2,
      v3,
      v4,
      v5,
      v6,
      v7,
      v8,
      v9,
      v10,
      v11,
      v12,
      v13,
      v14,
      v15,
      v16,
    ];
    return mat4(result);
  }
  aplly(target: Vector) {
    const v1 =
      target.data[0] * this.data[0] +
      target.data[1] * this.data[1] +
      target.data[2] * this.data[2] +
      target.data[3] * this.data[3];
    const v2 =
      target.data[0] * this.data[4] +
      target.data[1] * this.data[5] +
      target.data[2] * this.data[6] +
      target.data[3] * this.data[7];
    const v3 =
      target.data[0] * this.data[8] +
      target.data[1] * this.data[9] +
      target.data[2] * this.data[10] +
      target.data[3] * this.data[11];
    const v4 =
      target.data[0] * this.data[12] +
      target.data[1] * this.data[13] +
      target.data[2] * this.data[14] +
      target.data[3] * this.data[15];
    const result = [v1, v2, v3, v4];
    target.set(result);
  }
  transpose() {
    let nd = new Float32Array(16);
    nd[0] = this.data[0];
    nd[1] = this.data[4];
    nd[2] = this.data[8];
    nd[3] = this.data[12];
    nd[4] = this.data[1];
    nd[5] = this.data[5];
    nd[6] = this.data[9];
    nd[7] = this.data[13];
    nd[8] = this.data[2];
    nd[9] = this.data[6];
    nd[10] = this.data[10];
    nd[11] = this.data[14];
    nd[12] = this.data[3];
    nd[13] = this.data[7];
    nd[14] = this.data[11];
    nd[15] = this.data[15];
    this.data = nd;
    nd = null;
    return this;
  }
  static muls(ms: Matrix[]) {
    return ms.reverse().reduce((a, v) => {
      a.mul(v);
      return a;
    }, i());
  }
}

export function mat4(data: number[] | number[][], dType?: DType) {
  return new Matrix(data, dType);
}

export function i() {
  return new Matrix([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
}
