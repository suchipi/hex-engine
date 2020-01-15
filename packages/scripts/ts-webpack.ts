declare module "*.png" {
  const url: string;
  export default url;
}

declare module "*.gif" {
  const url: string;
  export default url;
}

declare module "*.jpg" {
  const url: string;
  export default url;
}

declare module "*.jpeg" {
  const url: string;
  export default url;
}

declare module "*.wav" {
  const url: string;
  export default url;
}

declare module "*.ogg" {
  const url: string;
  export default url;
}

declare module "*.mp3" {
  const url: string;
  export default url;
}

declare module "*.aseprite" {
  const data: AsepriteLoader.Data;
  export default data;
}

declare module "*.ase" {
  const data: AsepriteLoader.Data;
  export default data;
}

declare module "*.xml" {
  const data: XMLSourceLoader.Element;
  export default data;
}

declare module "*.fnt" {
  const data: BMFontLoader.Font;
  export default data;
}
