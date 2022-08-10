import { Matrix } from "./matrix";

export const createBuffer = (
  data: Matrix,
  usage: GPUBufferUsageFlags,
  device: GPUDevice
) => {
  const arr = data.array();
  const desc = {
    size: (data.byteLength * 4 + 3) & ~3,
    usage,
    mappedAtCreation: true,
  };
  const buffer = device.createBuffer(desc);
  const writeArray =
    arr instanceof Uint16Array
      ? new Uint16Array(buffer.getMappedRange())
      : new Float32Array(buffer.getMappedRange());
  writeArray.set(arr);
  buffer.unmap();
  return buffer;
};

export const createUniformBuffer = (data: Matrix, device: GPUDevice) => {
  return createBuffer(
    data,
    GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    device
  );
};

export const createVertexBuffer = (data: Matrix, device: GPUDevice) => {
  return createBuffer(
    data,
    GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    device
  );
};
