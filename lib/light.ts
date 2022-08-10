import { Vector } from "./vector";

class Light {
  constructor(public position: Vector) {}
}

export function light(position: Vector) {
  return new Light(position);
}
