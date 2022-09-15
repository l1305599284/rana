export class Material {
  constructor(
    public specular: number,
    public shininess: number,
    public diffuse: number,
    public ambient: number = 1
  ) {}
}

export function material(
  specular: number,
  shininess: number,
  diffuse: number,
  ambient: number = 1
) {
  return new Material(specular, shininess, diffuse, ambient);
}
