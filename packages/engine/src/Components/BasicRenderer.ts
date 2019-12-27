import Component from "../Component";
import AnimationSheet from "./AnimationSheet";
import Position from "./Position";

export default class BasicRenderer extends Component {
  draw({
    context,
  }: {
    context: CanvasRenderingContext2D;
    canvas: HTMLCanvasElement;
  }): void {
    const position = this.getComponent(Position);
    if (!position) return;

    const animSheet = this.getComponent(AnimationSheet);
    if (!animSheet) return;

    // TODO: Rotation

    const target = position.point.subtract(position.origin).round();

    animSheet.drawSpriteIntoContext({
      context,
      x: target.x,
      y: target.y,
    });
  }
}
