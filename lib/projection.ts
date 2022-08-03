import { scale, tl } from "./transform";

export function orthographic(
  l: number,
  r: number,
  b: number,
  t: number,
  n: number,
  f: number,
  leftHand = true
) {
  // 把世界坐标区域缩放到对应技术平台的标准NDC
  // 这里是webgpu的左手坐标系的z位0-1的区域
  const tra = tl(-(l + r) / 2, -(t + b) / 2, -n);
  const sca = scale(2 / (r - l), 2 / (t - b), 1 / f);
  return sca.mul(tra);
}
export function perspective(
  l: number,
  r: number,
  b: number,
  t: number,
  n: number,
  f: number,
  leftHand = true
) {
  const tra = tl(-(l + r) / 2, -(t + b) / 2, -(f + n) / 2);
  const sca = scale(2 / (r - l), 2 / (t - b), 2 / (f - n));
  return sca.mul(tra);
}
