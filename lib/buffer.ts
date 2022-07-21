export const createBuffer = (
  arr: Float32Array,
  usage: GPUBufferUsageFlags,
  device: GPUDevice
) => {
  const desc = {
    size: (arr.byteLength * 4 + 3) & ~3,
    usage,
    mappedAtCreation: true,
  };
  const buffer = device.createBuffer(desc);
  const writeArray = new Float32Array(buffer.getMappedRange());
  writeArray.set(arr);
  buffer.unmap();
  return buffer;
};

export const createUniformBuffer = (arr: Float32Array, device: GPUDevice) => {
  return createBuffer(
    arr,
    GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    device
  );
};
export const createVertexBuffer = (arr: Float32Array, device: GPUDevice) => {
  return createBuffer(
    arr,
    GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    device
  );
};
