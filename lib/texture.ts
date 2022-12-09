function createTexture(
  size: GPUExtent3DStrict,
  format: GPUTextureFormat,
  sampleCount: number,
  usage: GPUTextureUsageFlags,
  device: GPUDevice
) {
  return device.createTexture({
    size,
    format,
    sampleCount,
    usage,
  });
}

export function attachmentTexture(
  size: GPUExtent3DStrict,
  format: GPUTextureFormat,
  device: GPUDevice,
  sampleCount: number = 4
) {
  return createTexture(
    size,
    format,
    sampleCount,
    GPUTextureUsage.RENDER_ATTACHMENT,
    device
  );
}

export async function bigmap(img: RequestInfo | URL) {
  const res = await fetch(img);
  const imgBlob = await res.blob();
  const bigmap = await createImageBitmap(imgBlob);
  return bigmap;
}
export function linearSamplar(device: GPUDevice) {
  return device.createSampler({
    magFilter: "linear",
    minFilter: "linear",
  });
}
export function bitmapTexture(bitmap: ImageBitmap, device: GPUDevice) {
  return createTexture(
    [bitmap.width, bitmap.height],
    "rgba8unorm",
    1,
    GPUTextureUsage.TEXTURE_BINDING |
      GPUTextureUsage.COPY_DST |
      GPUTextureUsage.RENDER_ATTACHMENT,
    device
  );
}
