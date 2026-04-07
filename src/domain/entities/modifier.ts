export interface ModifierGroup {
  id: string;
  menuItemId: string;
  title: string;
  isRequired: boolean;
  minSelectable: number;
  maxSelectable: number;
  options?: ModifierOption[];
}

export interface ModifierOption {
  id: string;
  groupId: string;
  name: string;
  extraPrice: number;
  isAvailable: boolean;
}
