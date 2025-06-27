import {create} from 'zustand'

type ControllerStore = {
    enabled: boolean;
    setEnabled: (enabled: boolean) => void;
}

export const useControllerStore = create<ControllerStore>((set) => ({
    enabled: true,
    setEnabled: (enabled) => set(() => ({enabled})),
}))
