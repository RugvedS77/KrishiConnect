import { create } from 'zustand';

/**
 * This Zustand store manages which interface mode the farmer is currently viewing.
 * It's a simple global state accessible from any component.
 */
export const useInterfaceStore = create((set) => ({
  /**
   * The current active mode. Can be 'marketplace' or 'farmOS'.
   * The default is 'farmOS' as per the user flow.
   */
  mode: 'farmOS', 
  
  /**
   * An action to set the mode directly. This will be used by the toggle
   * buttons on the dashboards to switch between the two interfaces.
   * @param {'marketplace' | 'farmOS'} newMode - The new mode to set.
   */
  setMode: (newMode) => set({ mode: newMode }),
}));
