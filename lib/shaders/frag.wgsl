@group(1) @binding(0) var<storage> pointLight : array<f32>;
@group(1) @binding(1) var shadowMap: texture_depth_2d;
@group(1) @binding(2) var shadowSampler: sampler_comparison;
@fragment
fn main(
    @location(0) fragPosition : vec3<f32>,
    @location(1) fragNormal: vec3<f32>,
    @location(2) fragUV: vec2<f32>,
    @location(3) shadowPos: vec3<f32>,
    @location(4) fragColor: vec4<f32>
) -> @location(0) vec4<f32> {

    let objectColor = fragColor.rgb;
    
    // ambient
    let ambientColor = vec3(1.0, 1.0, 1.0);
    let ambientIntensity = 0.5;
    let lightNumber = arrayLength(&pointLight);

    var lightResult = ambientColor * ambientIntensity;
    // add shadow factor
    var shadow : f32 = 0.0;
    // apply Percentage-closer filtering (PCF)
    // sample nearest 9 texels to smooth result
    let size = f32(textureDimensions(shadowMap).x);
    for (var y : i32 = -1 ; y <= 1 ; y = y + 1) {
        for (var x : i32 = -1 ; x <= 1 ; x = x + 1) {
            let offset = vec2<f32>(f32(x) / size, f32(y) / size);
            shadow = shadow + textureSampleCompare(
                shadowMap, 
                shadowSampler,
                shadowPos.xy + offset, 
                shadowPos.z - 0.005  // apply a small bias to avoid acne
            );
        }
    }
    shadow = shadow / 9.0;
    if(lightNumber > 0){
      // Loop Point Light
      for(var i:u32 = 0; i < lightNumber; i += 8) {
           
            var pointLightPosition = vec3(pointLight[i],pointLight[i+1],pointLight[i+2]);
            var pointLightColor = vec3(pointLight[i+3],pointLight[i+4],pointLight[i+5]);
            var pointLightIntensity = pointLight[i+6];
            var pointLightRadius = pointLight[i+7];
            
            var L = pointLightPosition - fragPosition;
            var distance = length(L);

            if(distance < pointLightRadius) {

                var diffuse = max(dot(normalize(L), fragNormal), 0.0);
                var distanceFactor = pow(1.0 - distance / pointLightRadius, 2.0);
                var lightFactor = pointLightColor * pointLightIntensity * diffuse * distanceFactor;
                // lightResult += min(shadow * lightFactor, 1.0);

            }
     }
   }

    return vec4<f32>(objectColor * lightResult, 1.0);
}