const vertex = new Float32Array([
  // float3 position, float3 normal, float2 uv
  -1, 0, 1,   0, 1, 0,   0, 0, 
  1, 0, 1,   0, 1, 0,   1, 1, 
  1, 0, -1,   0, 1, 0,   0, 1,
  -1,0, -1,   0, 1, 0,   1, 0,
]);

const index = new Uint16Array([0, 1, 2, 2, 3, 0]);
const vertexCount = 4;
const indexCount = 6;

export { vertex, index, vertexCount, indexCount };
