type v4 = vec4<f32>;

struct VertexInput {
    @location(0) position: v4,
    @location(1) color: v4,
};

struct VertexOutput {
    @builtin(position) position:  v4,
    @location(0) color: v4,
};

@group(0) @binding(0) var<uniform> mvp: mat4x4<f32>; 

@vertex
fn vertexMain(vert: VertexInput) -> VertexOutput {

    var out: VertexOutput;
    out.color =  vert.color;
    out.position = mvp * vert.position;
    return out;
};

@fragment
fn fragmentMain(in: VertexOutput) -> @location(0) v4 {
    return v4(in.color);
}