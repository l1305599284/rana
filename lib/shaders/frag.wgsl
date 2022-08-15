@group(1) @binding(0) var<uniform> ambientIntensity : f32;
@group(1) @binding(1) var<uniform> pointLight : array<vec4<f32>, 2>;

@fragment
fn main(
    @location(0) fragPosition : vec3<f32>,
    @location(1) fragNormal: vec3<f32>,
    @location(2) fragUV: vec2<f32>,
    @location(3) fragColor: vec4<f32>
) -> @location(0) vec4<f32> {
    let objectColor = fragColor.rgb;
    let ambintLightColor = vec3(1.0,1.0,1.0);
    let pointLightColor = vec3(1.0,1.0,1.0);

    var lightResult = vec3(0.0, 0.0, 0.0);
    // ambient
    lightResult += ambintLightColor * ambientIntensity;
    
    // Point Light
    var pointPosition = pointLight[0].xyz;
    var pointIntensity = pointLight[1][0];
    var pointRadius = pointLight[1][1];
    var L = pointPosition - fragPosition;
    var distance = length(L);
    if(distance < pointRadius){
        var diffuse = max(dot(normalize(L), fragNormal), 0.0);
        var distanceFactor = pow(1.0 - distance / pointRadius, 2.0);
        lightResult += pointLightColor * pointIntensity * diffuse * distanceFactor;
    }

    return vec4<f32>(objectColor * lightResult, 1.0);
}