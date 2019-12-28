import { Point } from "../Models";

type Props = {
  point: Point;
  origin?: Point;
};

export default function Position({ point, origin = new Point(0, 0) }: Props) {
  return {
    point,
    origin,
  };
}
