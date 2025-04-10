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
    in_order:         boolean;
    city:             string;
}

export interface Question {
    text:    string;
    answers: Answer[];
}

export interface Answer {
    id:        number;
    text:      string;
    isCorrect: boolean;
}

export interface MarkerData {
    id:          number;
    latitude:    number;
    longitude:   number;
    name:        string;
    markerOrder: number;
    city:        string;
}

export type RouteData = {
    marker: MarkerData;
    question?: string;
    questionId?: number;
    answers?: Answer[];
}

export type Coordinate = {
    latitude: number
    longitude: number
}

export type QrCodeType = {
    name: string;
    routeId: number;
}