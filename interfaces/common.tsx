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