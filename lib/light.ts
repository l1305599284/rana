import { vec3, vec4, Vector } from "./vector";

export class Light {
  constructor(
    public color: Vector,
    public position: Vector,
    public intensity: number,
    public radius: number
  ) {}

  array() {
    return new Float32Array([
      ...this.position.data,
      this.intensity,
      this.radius,
    ]);
  }
}

export function createPointLight(
  color: Vector,
  position: Vector,
  intensity: number,
  radius: number
) {
  return new Light(color, position, intensity, radius);
}
