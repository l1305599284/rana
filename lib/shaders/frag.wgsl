@group(1) @binding(0) var<storage> pointLight : array<f32>;

@fragment
fn main(
    @location(0) fragPosition : vec3<f32>,
    @location(1) fragNormal: vec3<f32>,
    @location(2) fragUV: vec2<f32>,
    @location(3) fragColor: vec4<f32>
) -> @location(0) vec4<f32> {

    let objectColor = fragColor.rgb;
    
    // ambient
    let ambientColor = vec3(1.0, 1.0, 1.0);
    let ambientIntensity = 0.5;
    let lightNumber = arrayLength(&pointLight);

    var lightResult = ambientColor * ambientIntensity;

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
                lightResult += pointLightColor * pointLightIntensity * diffuse * distanceFactor;

            }
     }
   }
   
    return vec4<f32>(objectColor * lightResult, 1.0);
}