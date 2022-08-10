import { mat4 } from "./matrix";
import { Vector } from "./vector";
export function radians(angle: number) {
  return (angle * Math.PI) / 180;
}
export function triangle(angle: number) {
  return [Math.sin(radians(angle)), Math.cos(radians(angle))];
}

// 为了解决平移，引入齐次坐标
export function tl(x: number = 0, y: number = 0, z: number = 0) {
  return mat4([1, 0, 0, x, 0, 1, 0, y, 0, 0, 1, z, 0, 0, 0, 1]);
}

// 绕原点逆时针
export function rx(angle: number) {
  const [s, c] = triangle(angle);
  return mat4([1, 0, 0, 0, 0, c, -s, 0, 0, s, c, 0, 0, 0, 0, 1]);
}
// 绕原点逆时针
export function ry(angle: number) {
  const [s, c] = triangle(angle);
  return mat4([c, 0, 0, s, 0, 1, 0, 0, -s, 0, 0, c, 0, 0, 0, 1]);
}
// 绕原点逆时针
export function rz(angle: number) {
  const [s, c] = triangle(angle);
  return mat4([c, -s, 0, 0, s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
}

export function scale(x: number, y?: number, z?: number) {
  if ((x && y) || (x && z)) {
    mat4([x || 1, 0, 0, 0, 0, y || 1, 0, 0, 0, 0, z || 1, 0, 0, 0, 0, 1]);
  }
  return mat4([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 / x]);
}
export function reflect(x?: boolean, y?: boolean, z?: boolean) {
  return mat4([
    x ? -1 : 1,
    0,
    0,
    0,
    0,
    y ? -1 : 1,
    0,
    0,
    0,
    0,
    z ? -1 : 1,
    0,
    0,
    0,
    0,
    1,
  ]);
}
/**
 * view transform
 * @param position Point
 * @param lookAt Point
 * @param up Direction
 * @returns View Matrix Mat4x4
 */
export function view(position: Vector, lookAt: Vector, up: Vector) {
  // 相当于物体相对于相机相对于原点的运动
  // 先平移相机到原点
  const tv = tl(-position.data[0], -position.data[1], -position.data[2]);

  // 再旋转相机坐标系到原坐标系
  // 由于不好算，先算逆，即原坐标系旋转到相机坐标系
  // 又由于正交矩阵的逆等于转置
  // 用lookat叉乘up得到x方向

  const g = lookAt.sub(position);
  const t = up;
  const nx = t.cross(g);

  // const nx = g.cross(up);
  const rotate = mat4([
    nx.data[0],
    nx.data[1],
    nx.data[2],
    0,
    t.data[0],
    t.data[1],
    t.data[2],
    0,
    g.data[0],
    g.data[1],
    g.data[2],
    0,
    0,
    0,
    0,
    1,
  ]);
  return rotate.mul(tv);
}
export function orthographic(
  l: number,
  r: number,
  b: number,
  t: number,
  n: number,
  f: number
) {
  // 把世界坐标区域缩放到对应技术平台的标准NDC
  // 这里是webgpu的左手坐标系的z位0-1的区域
  const translateMat = tl(-(r + l) / 2, -(t + b) / 2, -n);
  const scaleMat = scale(2 / (r - l), 2 / (t - b), 1 / f);
  return scaleMat.mul(translateMat);
}

export function perspective(
  fov: number,
  aspectRatio: number,
  n: number,
  f: number
) {
  const t = Math.tan(radians(fov / 2)) * n;
  const r = aspectRatio * t;
  const l = -r;
  const b = -t;
  // 先把视锥体压缩成透视正交体
  const frustumToOrthMat = mat4([
    n,
    0,
    0,
    0,
    0,
    n,
    0,
    0,
    0,
    0,
    n + f,
    -n * f,
    0,
    0,
    1,
    0,
  ]);
  // 再用正交投影
  const orth = orthographic(l, r, b, t, n, f);
  return orth.mul(frustumToOrthMat);
}
