export interface Checkpoint {
    checkpoint_id:    number;
    route_id:         number;
    latitude:         string;
    longitude:        string;
    question_id:      number;
    checkpoint_order: number;
    created_at:       Date;
    updated_at:       Date;
    question:         Question;
    isAnswered?:      boolean;
}

export interface Question {
    text:    string;
    answers: Answer[];
}

export interface Answer {
    text:      string;
    isCorrect: boolean;
}

export interface MarkerData {
    id: number;
    latitude: number;
    longitude: number;
    name: string;
    markerOrder: number;
    city: string;
}

export interface AnswerData {
    id: number;
    text: string;
    isRight: boolean;
}

export type RouteData = {
    marker: MarkerData;
    question?: string;
    answers?: AnswerData[];
}

export type Coordinate = {
    latitude: number
    longitude: number
}