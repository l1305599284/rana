import { vec3, Vector } from "./vector";
import { lookAt, orthographic, perspective } from "./transform";
import { Scene } from "./scene";
import { Matrix } from "./matrix";
import { int } from "./types";
type CameraOptions = {
  position?: Vector;
  target: Vector;
  up?: Vector;
};

type OrthographicCameraOptions = CameraOptions & Partial<{
  l: number,
    r: number,
    b: number,
    t: number,
    n: number,
    f: number
}>

type PerspectiveCameraOptions = CameraOptions & Partial<{
  n: number,
  f: number,
  fov: number ,
  aspectRatio: number 
}>
const defaulCameraOptions = {
  position: vec3(0, 0, -1),
  target: vec3(0, 0, 0),
  up: vec3(0, 1, 0),
};
const defaulOrthographicCamera = {
  ...defaulCameraOptions,
  l:5,
  r:5,
  b:5,
  t:5,
  n:0,
  f:5,
};
const defaulPerspectiveCamera = {
  ...defaulCameraOptions,
  n: 0,
  f: 5,
  fov: 150,
  aspectRatio:  1
};


export abstract class Camera {
  angularSensibility: number;
  moveSensibility: number;
  position: Vector;
  target: Vector;
  up: Vector;
  constructor(public name: string, scene: Scene) {
    
    scene.addCamera(this);
  }
  abstract getViewProjectionMatrix():Matrix
  view() {
    return lookAt(this.position, this.target, this.up);
  } 
 

}

export class OrthographicCamera extends Camera{
  l: int; r: int; b: int; t: int; n: int; f: int
  getViewProjectionMatrix(): Matrix {
    return this.projection().mul(this.view())
  }

  constructor(public name: string, options: OrthographicCameraOptions, scene: Scene) {
    super(name,scene)
    for (const key in options) {
      if (Object.prototype.hasOwnProperty.call(defaulOrthographicCamera, key)) {
        this[key] = options[key];
      } else this[key] = defaulOrthographicCamera[key];
    }
  }
  projection(){
      return orthographic(this.l, this.r, this.b, this.t, this.n, this.f)
  }

}
export class PerspectiveCamera extends Camera{
  n: int
    f: int
    fov: int = 150
    aspectRatio: int = 1
  getViewProjectionMatrix(): Matrix {
    return this.projection().mul(this.view())
  }
  constructor(public name: string, options: PerspectiveCameraOptions, scene: Scene) {
    super(name,scene)
    for (const key in options) {
      if (Object.prototype.hasOwnProperty.call(defaulPerspectiveCamera, key)) {
        this[key] = options[key];
      } else this[key] = defaulPerspectiveCamera[key];
    }
  }
  projection(){
    return perspective(this.n, this.f, this.fov, this.aspectRatio)
  }
}


export function createPerspectiveCamera( name: string, options: PerspectiveCameraOptions, scene: Scene) {
  return new PerspectiveCamera(name,options,scene)
}
