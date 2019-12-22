import Component from "./Component";

type Data = {
  x: number;
  y: number;
  z: number;
};

export default class Position extends Component<Data> {
  defaults() {
    return {
      x: 0,
      y: 0,
      z: 0,
    };
  }
}
