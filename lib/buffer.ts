export const createBuffer = (
  arr: number[],
  usage: GPUBufferUsageFlags,
  device: GPUDevice
) => {
  const desc = {
    size: (arr.length * 4 + 3) & ~3,
    usage,
    mappedAtCreation: true,
  };
  const buffer = device.createBuffer(desc);
  const writeArray = new Float32Array(buffer.getMappedRange());
  writeArray.set(arr);
  buffer.unmap();
  return buffer;
};

export const createUniformBuffer = (arr: number[], device: GPUDevice) => {
  return createBuffer(
    arr,
    GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    device
  );
};
export const createVertexBuffer = (arr: number[], device: GPUDevice) => {
  return createBuffer(
    arr,
    GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    device
  );
};
