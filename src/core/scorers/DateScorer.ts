import { DateTest } from "../../model/tests/DateTest";
import { ScoreResult, TestScorer } from "../Scoring";

export class DateScorer implements TestScorer<DateTest> {

    async scoreAnswer(answer: any, test: DateTest, trialId: string): Promise<ScoreResult> {

        let score = 0;
        const correctAnswer = test.correctAnswer;

        if (correctAnswer.year !== undefined && correctAnswer.year !== null) {
            if (answer.year === correctAnswer.year) {
                return { score: 1  };
            }
        }

        return { score: 0 };

        // IMPORTANT NOTE:
        // -----------------------------------------------------------------
        // For now, only exact year match is considered correct
        // This is because the UI is lacking month/day inputs currently

        // Track how many of the components are correct
        // let totalComponents = 0;
        // let correctComponents = 0;

        // if (correctAnswer.year !== undefined && correctAnswer.year !== null) {
        //     totalComponents++;
        //     if (answer.year === correctAnswer.year) {
        //         correctComponents++;
        //     }
        // }

        // if (correctAnswer.month !== undefined && correctAnswer.month !== null) {
        //     totalComponents++;
        //     if (answer.month === correctAnswer.month) {
        //         correctComponents++;
        //     }
        // }

        // if (correctAnswer.day !== undefined && correctAnswer.day !== null) {
        //     totalComponents++;
        //     if (answer.day === correctAnswer.day) {
        //         correctComponents++;
        //     }
        // }

        // if (totalComponents > 0) {
        //     score = correctComponents / totalComponents;
        // }

        // return { score };

    }

}