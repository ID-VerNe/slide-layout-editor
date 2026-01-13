import { create } from 'zustand';

interface FreeformUIStore {
  selectedItemId: string | null;
  selectItem: (id: string | null) => void;
}

export const useFreeformStore = create<FreeformUIStore>((set) => ({
  selectedItemId: null,
  selectItem: (id) => set({ selectedItemId: id }),
}));