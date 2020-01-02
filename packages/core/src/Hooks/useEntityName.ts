import HooksSystem from "../HooksSystem";
const { useEntity } = HooksSystem.hooks;

export default function useEntityName(name: string) {
  const ent = useEntity();
  ent.name = name;
}
