import { useMemo } from "react";
import { useLocalStorage } from "./useLocalStorage.js";
import { AUTO_ITEMS } from "../data/checklistItems.js";

// Checklist state. `checked` and `customItems` are private (not shared via
// URL). `showCarItems` hides car-only items when the family travels in one car.
export const useChecklist = ({ cars = 1 } = {}) => {
  const [checked, setChecked] = useLocalStorage("fbt_checklist_checked", {});
  const [customItems, setCustomItems] = useLocalStorage("fbt_checklist_custom", []);

  const autoItems = useMemo(
    () => AUTO_ITEMS.filter((item) => !item.cars || cars > 1),
    [cars],
  );

  const toggleItem = (id) =>
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));

  const addCustom = (label, category) =>
    setCustomItems((prev) => [
      ...prev,
      { id: `custom_${Date.now()}`, label, category: category || "casa" },
    ]);

  const removeCustom = (id) =>
    setCustomItems((prev) => prev.filter((i) => i.id !== id));

  const allItems = [...autoItems, ...customItems];
  const total = allItems.length;
  const done = allItems.filter((i) => checked[i.id]).length;

  return { autoItems, customItems, checked, toggleItem, addCustom, removeCustom, total, done };
};
