import { Vector } from "./vector";
import { lookAt, orthographic, perspective } from "./transform";

export class Camera {
  constructor(
    public position: Vector,
    public target: Vector,
    public up: Vector
  ) {}

  mat() {
    return lookAt(this.position, this.target, this.up);
  }
}
export function camera(position: Vector, target: Vector, up: Vector) {
  return new Camera(position, target, up);
}
export function orthographicCamera(
  position: Vector,
  target: Vector,
  up: Vector
) {
  const v = new Camera(position, target, up);
  return function (
    l: number,
    r: number,
    b: number,
    t: number,
    n: number,
    f: number
  ) {
    return orthographic(l, r, b, t, n, f).mul(v.mat());
  };
}
export function perspectiveCamera(
  position: Vector,
  target: Vector,
  up: Vector
) {
  const v = new Camera(position, target, up);
  return function (
    n: number,
    f: number,
    fov: number = 150,
    aspectRatio: number = 1
  ) {
    return perspective(n, f, fov, aspectRatio).mul(v.mat());
  };
}
