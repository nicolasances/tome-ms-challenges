import { TomeTest } from "../TomeTest";

export class DateTest extends TomeTest {

    type: string = "date";
    testId: string;
    question: string; 
    correctAnswer: {
        day?: number;
        month?: number;
        year?: number;
    }

    answer?: {
        day?: number;
        month?: number;
        year?: number;
    }

    constructor({ testId, question, correctAnswer }: { testId: string; question: string; correctAnswer: { day?: number; month?: number; year?: number; } }) {
        super();
        this.testId = testId;
        this.question = question;
        this.correctAnswer = correctAnswer;
    }

}