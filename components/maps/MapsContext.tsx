import React, {createContext, useContext, Dispatch, useReducer} from 'react';
import {Checkpoint} from "@/interfaces/common";

interface MapsState {
    checkpoints: Checkpoint[];
}
const initialState: MapsState = {
    checkpoints: [],
}

const MapsStateContext = createContext<MapsState>(initialState);
const MapsDispatchContext = createContext<Dispatch<any>>(() => {});

export function MapsProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(
        mapsReducer,
        initialState
    );

    return (
        <MapsStateContext.Provider value={state}>
            <MapsDispatchContext.Provider value={dispatch}>
                {children}
            </MapsDispatchContext.Provider>
        </MapsStateContext.Provider>
    )
}

export function useMapsState() {
    return useContext(MapsStateContext);
}
export function useMapDispatch() {
    return useContext(MapsDispatchContext);
}

const mapsReducer = (state: MapsState, callback: (prevState: Checkpoint[]) => Checkpoint[]) => {
    const checkpoints = callback([...state.checkpoints])
    return { checkpoints: checkpoints };
}
