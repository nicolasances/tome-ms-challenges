import { DateTest } from "../../model/tests/DateTest";
import { TestScorer } from "../Scoring";

export class DateScorer implements TestScorer<DateTest> {

    async scoreAnswer(answer: any, test: DateTest, trialId: string): Promise<number> {

        let score = 0;
        const correctAnswer = test.correctAnswer;

        // Track how many of the components are correct
        let totalComponents = 0;
        let correctComponents = 0;

        if (correctAnswer.year !== undefined && correctAnswer.year !== null) {
            totalComponents++;
            if (answer.year === correctAnswer.year) {
                correctComponents++;
            }
        }

        if (correctAnswer.month !== undefined && correctAnswer.month !== null) {
            totalComponents++;
            if (answer.month === correctAnswer.month) {
                correctComponents++;
            }
        }

        if (correctAnswer.day !== undefined && correctAnswer.day !== null) {
            totalComponents++;
            if (answer.day === correctAnswer.day) {
                correctComponents++;
            }
        }

        if (totalComponents > 0) {
            score = correctComponents / totalComponents;
        }

        return score;

    }

}