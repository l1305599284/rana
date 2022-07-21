type float4 = vec4<f32>;

struct VertexInput {
    @location(0) position: float4,
    @location(1) color: float4,
};

struct VertexOutput {
    @builtin(position) position: float4,
    @location(0) color: float4,
};

@group(0) @binding(0) var<uniform> mvp: mat4x4<f32>; 

@vertex
fn vertexMain(vert: VertexInput) -> VertexOutput {
    var out: VertexOutput;
    out.color = vert.color;
    out.position = vert.position;
    return out;
};

@fragment
fn fragmentMain(in: VertexOutput) -> @location(0) float4 {
    return float4(in.color);
}