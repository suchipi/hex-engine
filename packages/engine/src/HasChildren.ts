export default interface HasChildren<Child> {
  hasChild(child: Child): boolean;
  addChild(child: Child): void;
  removeChild(child: Child): void;
}
