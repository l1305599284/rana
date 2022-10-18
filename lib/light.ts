import { Color, color3 } from "./color";
import { Scene } from "./scene";
import { FloatArray } from "./types";
import { vec3, vec4, Vector } from "./vector";
export type LightOptions = {
  color?: Vector;
  position: Vector;
  intensity?: number;
  radius?: number;
};
const defaulLightOptions = {
  position:vec3(0,0,0),
  color: color3(1, 1, 1),
  intensity: 1,
  radius: 5,
};
export abstract class Light {
  radius: number;
  position: Vector;
  color: Vector;
  intensity: number;

  constructor(public name: string, scene: Scene) {
    scene.addLight(this);
  }
  array(){
    return new Float32Array([this.position.array()[0],this.position.array()[1],this.position.array()[2],
    this.color.array()[0],this.color.array()[1],this.color.array()[2]
    , this.intensity, this.radius]);
  }

}
export class PointLight extends Light {
  constructor(public name: string, options: LightOptions, scene: Scene) {
    super(name, scene);
    for (const key in defaulLightOptions) {
      if (Object.prototype.hasOwnProperty.call(options, key)) {
        this[key] = options[key];
      } else this[key] = defaulLightOptions[key];
    }
  }
}

export function createPointLight(
  name: string,
  options: LightOptions,
  scene: Scene
) {
  return new PointLight(name, options, scene);
}
