const vertex = new Float32Array([
  // float3 position, float3 normal, float2 uv
  0.5, -0.5, 0, 0, 0, -1, 1, 1, -0.5, -0.5, 0, 0, 0, -1, 0, 1, 0, 0.5, 0, 0, 0,
  -1, 0.5, 0,
]);

const index = new Uint16Array([0, 1, 2, 0]);
const vertexCount = 3;
const indexCount = 4;

export { vertex, index, vertexCount, indexCount };
