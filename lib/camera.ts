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
    // 先平移相机到原点
    const tv = tl(
      -this.position.data[0],
      -this.position.data[1],
      -this.position.data[2]
    );
    // 再旋转相机坐标系到原坐标系
    // 由于不好算，先算逆，即原坐标系旋转到相机坐标系
    // 又由于正交矩阵的逆等于转置

    // 因为左手坐标系的原因，用up和lookat顺序求叉积得到x方向
    const x = this.up.cross(this.lookAt);

    return mat4([
      x.data[0],
      x.data[1],
      x.data[2],
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
