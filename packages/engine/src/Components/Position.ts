import Component from "./Component";
import { Point, makePoint } from "../Models";

export default class Position extends Component<Point> {
  defaults() {
    return makePoint(0, 0);
  }
}
