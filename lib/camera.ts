import { Vector } from "./vector";
import { tl } from "./transform";
import { mat4 } from "./matrix";
class Camera {
  constructor(
    public position: Vector,
    public lookAt: Vector,
    public up: Vector
  ) {}

  mat() {
    // 相当于物体相对于相机相对于原点的运动
    const [x, y, z] = this.position.data;
    // 先平移相机到原点
    const tv = tl(-x, -y, -z);
    // 再旋转相机坐标系到原坐标系
    // 由于不好算，先算逆，即原坐标系旋转到相机坐标系
    // 又由于正交矩阵的逆等于转置

    // 因为左手坐标系的原因，用up和lookat的叉积
    const gxt = this.up.cross(this.lookAt);
    console.log(gxt);

    return mat4([
      gxt.data[0],
      gxt.data[1],
      gxt.data[2],
      0,
      this.up.data[0],
      this.up.data[1],
      this.up.data[2],
      0,
      this.lookAt.data[0],
      this.lookAt.data[1],
      this.lookAt.data[2],
      0,
      0,
      0,
      0,
      1,
    ]).mul(tv);
  }
}

export function camera(position: Vector, lookAt: Vector, up: Vector) {
  return new Camera(position, lookAt, up);
}
