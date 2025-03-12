import React, {createContext, useContext, Dispatch, useReducer} from 'react';

import { RouteData } from '@/interfaces/common';

enum ActionType {
    ADD = 'add',
    CHANGE = 'change',
    DELETE = 'delete',
}

interface CreateAction {
    type: ActionType;
    checkpoint: RouteData;
}

// An interface for our state
interface CreateState {
    checkpoints: RouteData[];
}

const initialState = {
    checkpoints: [],
};

const CreateContext = createContext<{state: CreateState, dispatch: Dispatch<any> }>(
    {
        state: initialState,
        dispatch: () => {}
    });

export function MapProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(
        createReducer,
        initialState
    );

    return (
        <CreateContext.Provider value={{ state, dispatch }}>
            {children}
        </CreateContext.Provider>
    )

}

export function useCreateDispatch() {
    return useContext(CreateContext);
}


function createReducer(state: CreateState, action: CreateAction) {
    const { type, checkpoint } = action;
    switch (type) {
        case ActionType.ADD: {
            return { checkpoints: [...state.checkpoints, checkpoint] };
        }
        case ActionType.CHANGE: {
            return {
                checkpoints: state.checkpoints.map(r =>
                    r.marker.id === checkpoint.marker.id ? {
                        ...r,
                        question: checkpoint.question,
                        answers: checkpoint.answers
                    } : r
                )
            };
        }
        case ActionType.DELETE: {
            return { checkpoints: state.checkpoints.filter(r => r.marker.id !== checkpoint.marker.id) };
        }
        default: {
            throw Error('Unknown action: ' + action.type);
        }
    }
}