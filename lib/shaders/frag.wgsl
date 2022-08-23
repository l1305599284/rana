
@group(1) @binding(0) var<storage> pl : array<f32>;

@fragment
fn main(
    @location(0) fragPosition : vec3<f32>,
    @location(1) fragNormal: vec3<f32>,
    @location(2) fragUV: vec2<f32>,
    @location(3) fragColor: vec4<f32>
) -> @location(0) vec4<f32> {
    let objectColor = fragColor.rgb;
    let pointLightColor = vec3(1.0,1.0,1.0);
    let ambientColor = vec3(1.0, 1.0, 1.0);
    let ambientIntensity = 0.5;
    var lightResult = vec3(0.0, 0.0, 0.0);
    // // ambient
    lightResult += ambientColor * ambientIntensity;
    
    // // Point Light
       var pointPosition = vec3(pl[0],pl[1],pl[2]);
    var pointIntensity = pl[3];
    var pointRadius = pl[4];
    var L = pointPosition - fragPosition;
    var distance = length(L);
    if(distance < pointRadius){
        var diffuse = max(dot(normalize(L), fragNormal), 0.0);
        var distanceFactor = pow(1.0 - distance / pointRadius, 2.0);
        lightResult += pointLightColor * pointIntensity * diffuse * distanceFactor;
    }

    return vec4<f32>(objectColor * lightResult, 1.0);
}