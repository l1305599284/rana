import { Vector } from "./vector";
import { view } from "./transform";

class Light {
  constructor(public position: Vector) {}
}

export function light(position: Vector) {
  return new Light(position);
}
