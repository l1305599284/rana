import { Scene } from "../scene";
import { int } from "../types";
import { Mesh } from "./mesh";
type  BoxOptions ={
    width:int,
    height:int
}

const defaulBoxOptions = {
    width:1,
    htight:1
}
class BoxMesh extends Mesh {
    width:int
    height:int
    constructor( name: string, scene: Scene,options?: BoxOptions, ) {
        super(name, scene);
        for (const key in options) {
            if (Object.prototype.hasOwnProperty.call(defaulBoxOptions, key)) {
              this[key] = options[key];
            } else this[key] = defaulBoxOptions[key];
          }
    }
}

export function createBox( name: string,  scene: Scene,options?: BoxOptions,) {
    return new BoxMesh(name,scene,options)
}
