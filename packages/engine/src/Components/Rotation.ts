import Component, { ComponentConfig } from "../Component";
import { Angle } from "../Models";

export default class Rotation extends Component {
  angle: Angle;

  constructor(angle: Angle | number, config: Partial<ComponentConfig> = {}) {
    super(config);

    if (typeof angle === "number") {
      this.angle = new Angle(angle);
    } else {
      this.angle = new Angle(angle.radians);
    }
  }
}
