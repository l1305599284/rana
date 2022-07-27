import { Vector } from "./vector";

export type DType = "f32" | "f16";
export class Matrix {
  data: Float32Array;
  byteLength: number;
  size: number;
  constructor(data: number[] | number[][], public dType: DType = "f32") {
    if ((dType = "f32")) this.data = new Float32Array(data.flat());
    this.byteLength = this.data.byteLength;
    this.size = this.data.length;
  }
  deta() {
    // return this.data[0] * this.data[0];
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
    return mat(result);
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
  T() {
    const temp = this.data;
    this.data[0] = temp[0];
    this.data[1] = temp[4];
    this.data[2] = temp[8];
    this.data[3] = temp[12];
    this.data[4] = temp[1];
    this.data[5] = temp[5];
    this.data[6] = temp[9];
    this.data[7] = temp[13];
    this.data[8] = temp[2];
    this.data[9] = temp[6];
    this.data[10] = temp[10];
    this.data[11] = temp[14];
    this.data[12] = temp[3];
    this.data[13] = temp[7];
    this.data[14] = temp[11];
    this.data[15] = temp[15];
  }
}

export function mat(data: number[] | number[][], dType?: DType) {
  return new Matrix(data, dType);
}

export function i() {
  return new Matrix([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
}
