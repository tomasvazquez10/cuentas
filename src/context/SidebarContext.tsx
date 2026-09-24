import { createContext, useContext } from 'react';

type SidebarContextValue = {
  collapsed: boolean;
  toggle: () => void;
  close: () => void;
};

export const SidebarContext = createContext<SidebarContextValue>({
  collapsed: false,
  toggle: () => undefined,
  close: () => undefined,
});

export function useSidebar() {
  return useContext(SidebarContext);
}
