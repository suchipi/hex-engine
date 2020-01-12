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

declare module "layout-bmfont-text" {
  export interface LayoutOptions {
    font: BMFontLoader.Font;
    text: string;
    width?: number;
    mode?: "pre" | "nowrap";
    align?: "left" | "center" | "right";
    letterSpacing?: number;
    lineHeight?: number;
    tabSize?: number;
    start?: number;
    end?: number;
  }

  export interface Layout {
    update(opt: LayoutOptions): void;
    glyphs: Array<{
      index: number;
      data: BMFontLoader.Font["chars"][0];
      position: [number, number];
      line: number;
    }>;

    width: number;
    height: number;
    baseline: number;
    xHeight: number;
    descender: number;
    ascender: number;
    capHeight: number;
    lineHeight: number;
  }

  function createLayout(opts: LayoutOptions): Layout;

  export default createLayout;
}
