import { Matrix } from "./matrix";

export const createMappedBuffer = (
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

export const createMappedUniformBuffer = (data: Matrix, device: GPUDevice) => {
  return createMappedBuffer(
    data,
    GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    device
  );
};

export const createMappedVertexBuffer = (data: Matrix, device: GPUDevice) => {
  return createMappedBuffer(
    data,
    GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    device
  );
};

export const createBuffer = (
  size: number,
  usage: GPUBufferUsageFlags,
  device: GPUDevice
) => {
  return device.createBuffer({
    size,
    usage,
  });
};

export const createUniformBuffer = (size: number, device: GPUDevice) => {
  return createBuffer(
    size,
    GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    device
  );
};

export const createVertexBuffer = (size: number, device: GPUDevice) => {
  return createBuffer(
    size,
    GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    device
  );
};

export const createBindingGroup = (
  buffers: GPUBuffer[],
  layout: GPUBindGroupLayout,
  device: GPUDevice
) => {
  return device.createBindGroup({
    layout,
    entries: buffers.map((v, i) => ({
      binding: i,
      resource: {
        buffer: v,
      },
    })),
  });
};
