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
  label: string,
  size: number,
  usage: GPUBufferUsageFlags,
  device: GPUDevice
) => {
  return device.createBuffer({
    label,
    size,
    usage,
  });
};

export const createUniformBuffer = (
  label: string,
  size: number,
  device: GPUDevice
) => {
  return createBuffer(
    label,
    size,
    GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    device
  );
};

export const createStorageBuffer = (
  label: string,
  size: number,
  device: GPUDevice
) => {
  return createBuffer(
    label,
    size,
    GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    device
  );
};
export const createIndexBuffer = (
  label: string,
  size: number,
  device: GPUDevice
) => {
  return createBuffer(
    label,
    size,
    GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
    device
  );
};
export const createVertexBuffer = (
  label: string,
  size: number,
  device: GPUDevice
) => {
  return createBuffer(
    label,
    size,
    GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    device
  );
};

export const createBindingGroup = (
  label: string,
  buffers: (GPUBuffer|GPUTextureView|GPUSampler)[],
  layout: GPUBindGroupLayout,
  device: GPUDevice
) => {
  return device.createBindGroup({
    label,
    layout,
    entries: buffers.map((v, i) => ({
      binding: i,
      resource: {
        buffer: v,
      },
    })) as Iterable<GPUBindGroupEntry>,
  });
};
