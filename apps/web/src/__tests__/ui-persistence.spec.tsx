import { useUIStore } from '../store/ui-store';

describe('Zustand UI Store Persistence', () => {
  beforeEach(() => {
    localStorage.clear();
    useUIStore.setState({
      sidebarCollapsed: false,
      commandPaletteOpen: false,
    });
  });

  it('should toggle sidebarCollapsed status', () => {
    const { toggleSidebar } = useUIStore.getState();
    toggleSidebar();
    expect(useUIStore.getState().sidebarCollapsed).toBe(true);

    toggleSidebar();
    expect(useUIStore.getState().sidebarCollapsed).toBe(false);
  });

  it('should update commandPaletteOpen state', () => {
    const { setCommandPaletteOpen } = useUIStore.getState();
    setCommandPaletteOpen(true);
    expect(useUIStore.getState().commandPaletteOpen).toBe(true);

    setCommandPaletteOpen(false);
    expect(useUIStore.getState().commandPaletteOpen).toBe(false);
  });
});
