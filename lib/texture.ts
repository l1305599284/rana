function texture(
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
  return texture(
    size,
    format,
    sampleCount,
    GPUTextureUsage.RENDER_ATTACHMENT,
    device
  );
}
