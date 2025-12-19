
/**
 * A Trial represents an attempt by a user to complete a challenge. 
 * 
 * The Trial gathers the list of answers provided by the user and will track the score.
 */
export class Trial {

    id?: string; 
    challengeId: string; 

    startedOn: Date;
    completedOn?: Date;
    expiresOn: Date;    // The date when the trial's results expire. This is typically defined at a challenge level, and tracked in the trial for convenience, but also for tracking and ML.
    score?: number;

    answers?: TestAnswer[];

    constructor({ id, challengeId, startedOn, expiresOn, completedOn, score, answers }: { id?: string; challengeId: string; startedOn: Date; expiresOn: Date; completedOn?: Date; score?: number; answers?: TestAnswer[]; }) {
        this.id = id;
        this.challengeId = challengeId;
        this.startedOn = startedOn;
        this.completedOn = completedOn;
        this.expiresOn = expiresOn;
        this.score = score;
        this.answers = answers;
    }

    static fromHTTPRequest(data: any): Trial {
        return new Trial({
            id: data.id,
            challengeId: data.challengeId,
            startedOn: new Date(data.startedOn),
            expiresOn: new Date(data.expiresOn),
            completedOn: data.completedOn ? new Date(data.completedOn) : undefined,
            score: data.score !== undefined ? data.score : undefined,
            answers: data.answers,
        });
    }

    static fromMongoDoc(doc: any): Trial {
        return new Trial({
            id: doc._id.toString(),
            challengeId: doc.challengeId,
            startedOn: new Date(doc.startedOn),
            expiresOn: new Date(doc.expiresOn),
            completedOn: doc.completedOn ? new Date(doc.completedOn) : undefined,
            score: doc.score !== undefined ? doc.score : undefined,
            answers: doc.answers,
        });
    }

    toMongoDoc(): any {
        return {
            challengeId: this.challengeId,
            startedOn: this.startedOn,
            expiresOn: this.expiresOn,
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