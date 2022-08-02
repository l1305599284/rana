export const createBuffer = (
  data: Float32Array,
  usage: GPUBufferUsageFlags,
  device: GPUDevice
) => {
  const desc = {
    size: (data.byteLength * 4 + 3) & ~3,
    usage,
    mappedAtCreation: true,
  };
  const buffer = device.createBuffer(desc);
  const writeArray = new Float32Array(buffer.getMappedRange());
  writeArray.set(data);
  buffer.unmap();
  return buffer;
};

export const createUniformBuffer = (data: Float32Array, device: GPUDevice) => {
  return createBuffer(
    data,
    GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    device
  );
};

export const createVertexBuffer = (data: Float32Array, device: GPUDevice) => {
  return createBuffer(
    data,
    GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    device
  );
};
