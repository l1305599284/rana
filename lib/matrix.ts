export type DType = "f32" | "f16";
class Matrix {
  data: Float32Array;
  byteLength: number;
  size: number;
  constructor(data: number[] | number[][], public dType: DType = "f32") {
    if ((dType = "f32")) this.data = new Float32Array(data.flat());
    this.byteLength = this.data.byteLength;
    this.size = this.data.length;
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
  static I() {
    return new Matrix([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
  }
}

export function mat(data: number[] | number[][], dType?: DType) {
  return new Matrix(data, dType);
}
