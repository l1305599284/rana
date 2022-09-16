import { Color, color3 } from "./color";
import { Scene } from "./scene";
import { vec3, vec4, Vector } from "./vector";
export type LightOptions = {
  color?: Vector;
  position: Vector;
  intensity?: number;
  radius?: number;
};
const defaulLightOptions = {
  color: color3(1, 1, 1),
  intensity: 1,
  radius: 1,
};
export class Light {
  constructor(public name: string, options: LightOptions, scene: Scene) {
    for (const key in options) {
      if (Object.prototype.hasOwnProperty.call(defaulLightOptions, key)) {
        this[key] = options[key];
      } else this[key] = defaulLightOptions[key];
    }
    scene.addLight(this);
  }
}

export function createPointLight(
  name: string,
  options: LightOptions,
  scene: Scene
) {
  return new Light(name, options, scene);
}
