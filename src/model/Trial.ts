
export class Trial {

    trialId: string; 
    topicId: string; 
    topicCode: string; 
    challengeType: string;

    startedOn: Date;
    completedOn: Date | null;
    score: number | null;

    answers: TestAnswer[];

    constructor({ trialId, topicId, topicCode, challengeType, startedOn, completedOn, score, answers }: { trialId: string; topicId: string; topicCode: string; challengeType: string; startedOn: Date; completedOn: Date | null; score: number | null; answers: TestAnswer[]; }) {
        this.trialId = trialId;
        this.topicId = topicId;
        this.topicCode = topicCode;
        this.challengeType = challengeType;
        this.startedOn = startedOn;
        this.completedOn = completedOn;
        this.score = score;
        this.answers = answers;
    }

}

export interface TestAnswer {
    testId: string; 
    answer: any;
}