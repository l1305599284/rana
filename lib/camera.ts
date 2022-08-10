import { Vector } from "./vector";
import { view } from "./transform";

class Camera {
  constructor(
    public position: Vector,
    public lookAt: Vector,
    public up: Vector
  ) {}

  mat() {
    return view(this.position, this.lookAt, this.up);
  }
}

export function camera(position: Vector, lookAt: Vector, up: Vector) {
  return new Camera(position, lookAt, up);
}
