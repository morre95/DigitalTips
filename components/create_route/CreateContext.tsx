import React, {createContext, useContext, Dispatch, useReducer} from 'react';

import { RouteData } from '@/interfaces/common';
import {updateMarkerOrderForRoutes} from "@/functions/UpdateMarkerOrderForRoutes";

enum ActionType {
    ADD = 'add',
    ADD_Question = 'addQuestion',
    MOVE_CHECKPOINT = 'moveCheckpoint',
    CHANGE_ORDER = 'changeOrder',
    DELETE = 'delete',
    DELETE_ALL = 'deleteAll',
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
        case ActionType.ADD_Question: {
            return {
                checkpoints: state.checkpoints.map(r =>
                    r.marker.id === checkpoint.marker.id ? {
                        ...r,
                        question: checkpoint.question,
                        answers: checkpoint.answers,
                    } : r
                )
            };
        }
        case ActionType.MOVE_CHECKPOINT: {
            return {
                checkpoints: state.checkpoints.map(r =>
                    r.marker.id === checkpoint.marker.id ? {
                        ...r,
                        latitude: checkpoint.marker.latitude,
                        longitude: checkpoint.marker.longitude,
                    } : r
                )
            };
        }
        case ActionType.CHANGE_ORDER: {
            return {
                checkpoints: updateMarkerOrderForRoutes(state.checkpoints, checkpoint.marker.id, checkpoint.marker.markerOrder)
            }
        }
        case ActionType.DELETE_ALL: {
            return { checkpoints: [] };
        }
        case ActionType.DELETE: {
            return { checkpoints: state.checkpoints.filter(r => r.marker.id !== checkpoint.marker.id) };
        }
        default: {
            throw Error('Unknown action: ' + action.type);
        }
    }
}