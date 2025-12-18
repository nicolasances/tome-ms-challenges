
/**
 * A Trial represents an attempt by a user to complete a challenge. 
 * 
 * The Trial gathers the list of answers provided by the user and will track the score.
 */
export class Trial {

    id?: string; 
    challengeId: string; 

    startedOn: Date;
    completedOn: Date | null;
    score: number | null;

    answers: TestAnswer[];

    constructor({ id, challengeId, startedOn, completedOn, score, answers }: { id?: string; challengeId: string; startedOn: Date; completedOn: Date | null; score: number | null; answers: TestAnswer[]; }) {
        this.id = id;
        this.challengeId = challengeId;
        this.startedOn = startedOn;
        this.completedOn = completedOn;
        this.score = score;
        this.answers = answers;
    }

    static fromHTTPRequest(data: any): Trial {
        return new Trial({
            id: data.id,
            challengeId: data.challengeId,
            startedOn: new Date(data.startedOn),
            completedOn: data.completedOn ? new Date(data.completedOn) : null,
            score: data.score !== undefined ? data.score : null,
            answers: data.answers || [],
        });
    }

    static fromMongoDoc(doc: any): Trial {
        return new Trial({
            id: doc._id.toString(),
            challengeId: doc.challengeId,
            startedOn: new Date(doc.startedOn),
            completedOn: doc.completedOn ? new Date(doc.completedOn) : null,
            score: doc.score !== undefined ? doc.score : null,
            answers: doc.answers || [],
        });
    }

    toMongoDoc(): any {
        return {
            challengeId: this.challengeId,
            startedOn: this.startedOn,
            completedOn: this.completedOn,
            score: this.score,
            answers: this.answers,
        };
    }

}

export interface TestAnswer {
    testId: string; 
    answer: any;
}