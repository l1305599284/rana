import { mat } from "./matrix";
export function radians(angle: number) {
  return (angle * Math.PI) / 180;
}
export function triangle(angle: number) {
  return [Math.sin(radians(angle)), Math.cos(radians(angle))];
}
export function tl(x: number = 0, y: number = 0, z: number = 0) {
  return mat([1, 0, 0, x, 0, 1, 0, y, 0, 0, 1, z, 0, 0, 0, 1]);
}
export function rx(angle: number) {
  const [s, c] = triangle(angle);
  return mat([1, 0, 0, 0, 0, c, -s, 0, 0, s, c, 0, 0, 0, 0, 1]);
}
export function ry(angle: number) {
  const [s, c] = triangle(angle);
  return mat([c, 0, 0, s, 0, 1, 0, 0, -s, 0, 0, c, 0, 0, 0, 1]);
}
export function rz(angle: number) {
  const [s, c] = triangle(angle);
  return mat([c, -s, 0, 0, s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
}

export function scale(x: number, y?: number, z?: number) {
  if ((x && y) || (x && z)) {
    mat([x || 1, 0, 0, 0, 0, y || 1, 0, 0, 0, 0, z || 1, 0, 0, 0, 0, 1]);
  }
  return mat([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 / x]);
}
