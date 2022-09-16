import { vec3, Vector } from "./vector";
import { lookAt, orthographic, perspective } from "./transform";
import { Scene } from "./scene";
type CameraOptions = {
  position: Vector;
  target: Vector;
  up: Vector;
};
const defaulCameraOptions = {
  position: vec3(0, 0, -1),
  target: vec3(0, 0, 0),
  up: vec3(0, 1, 0),
};
export abstract class Camera {
  angularSensibility: number;
  moveSensibility: number;
  position: Vector;
  target: Vector;
  up: Vector;
  constructor(public name: string, options: CameraOptions, scene: Scene) {
    for (const key in options) {
      if (Object.prototype.hasOwnProperty.call(defaulCameraOptions, key)) {
        this[key] = options[key];
      } else this[key] = defaulCameraOptions[key];
    }
    scene.addCamera(this);
  }

  view() {
    return lookAt(this.position, this.target, this.up);
  }

  projection() {}
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

export function createPerspectiveCamera() {}
