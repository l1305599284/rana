import { scale, tl } from "./transform";

export function orthographic(
  l: number,
  r: number,
  b: number,
  t: number,
  n: number,
  f: number,
  leftHand?: true
) {
  const tra = tl(-(l + r) / 2, -(t + b) / 2, -(f + n) / 2);
  const sca = scale(2 / (r - l), 2 / (t - b), 2 / (f - n));
  return sca.mul(tra);
}
export function perspective(
  l: number,
  r: number,
  b: number,
  t: number,
  n: number,
  f: number,
  leftHand?: true
) {
  const tra = tl(-(l + r) / 2, -(t + b) / 2, -(f + n) / 2);
  const sca = scale(2 / (r - l), 2 / (t - b), 2 / (f - n));
  return sca.mul(tra);
}
