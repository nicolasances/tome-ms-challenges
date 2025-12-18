import { ValidationError } from "toto-api-controller";
import { SectionChallenge } from "../TomeChallenge";
import { TomeTest } from "../TomeTest";

export class JuiceChallenge extends SectionChallenge {

    public type: "section" = "section";
    public code: string = "juice";
    public name: string = "The Juice Challenge";
    public description: string = "Figure out if you can remember the juice of this topic!";

    public topicId: string;
    public topicCode: string;
    public sectionIndex: number;
    public sectionCode: string;
    
    public context: string;
    public toRemember: ToRemember[];
    public tests: TomeTest[];

    constructor({ topicId, topicCode, sectionIndex, sectionCode, context, toRemember, tests }: { topicId: string, topicCode: string, sectionIndex: number, sectionCode: string, context: string, toRemember: ToRemember[], tests: TomeTest[] }) {
        super();
        this.topicId = topicId;
        this.topicCode = topicCode;
        this.sectionIndex = sectionIndex;
        this.sectionCode = sectionCode;
        this.context = context;
        this.toRemember = toRemember;
        this.tests = tests;
    }

    static fromMongoDoc(doc: any): JuiceChallenge {
        return new JuiceChallenge({
            topicId: doc.topicId,
            topicCode: doc.topicCode,
            sectionIndex: doc.sectionIndex,
            sectionCode: doc.sectionCode,
            context: doc.context,
            toRemember: doc.toRemember, 
            tests: doc.tests
        });
    }

    static fromHTTPBody(body: any): JuiceChallenge {

        // Check mandatory fields
        if (!body.topicId) throw new ValidationError(400, 'The topicId is required');
        if (!body.topicCode) throw new ValidationError(400, 'The topicCode is required');
        if (body.sectionIndex == null) throw new ValidationError(400, 'The sectionIndex is required');
        if (!body.sectionCode) throw new ValidationError(400, 'The sectionCode is required');
        if (!body.context) throw new ValidationError(400, 'The context is required');
        if (!body.toRemember || !Array.isArray(body.toRemember)) throw new ValidationError(400, 'The toRemember array is required');
        if (!body.tests || !Array.isArray(body.tests)) throw new ValidationError(400, 'The tests array is required');

        return new JuiceChallenge({
            topicId: body.topicId,
            topicCode: body.topicCode,
            sectionIndex: body.sectionIndex,
            sectionCode: body.sectionCode,
            context: body.context,
            toRemember: body.toRemember, 
            tests: body.tests || []
        });
    }

    public toMongoDoc() {
        return {
            type: this.type,
            topicId: this.topicId,
            topicCode: this.topicCode,
            sectionIndex: this.sectionIndex,
            sectionCode: this.sectionCode,
            context: this.context,
            toRemember: this.toRemember, 
            tests: this.tests
        };
    }

}

interface ToRemember {
    toRemember: string;
    date?: SplitDate | null;
}

interface SplitDate {
    day: number | null;
    month: number | null;
    year: number | null;
}