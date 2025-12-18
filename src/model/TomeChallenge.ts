import { TomeTest } from "./TomeTest";

export abstract class TomeChallenge {
    public abstract type: "topic" | "section" | "general";
    public abstract code: string;           // Unique code for the challenge
    public abstract name: string;           // Human-friendly name
    public abstract description: string;    // Human-friendly description of the challenge
    
    public abstract tests: TomeTest[];      // Tests associated with this challenge

    public abstract toMongoDoc(): any;
}

/**
 * Challenges that are related to a specific Topic
 */
export abstract class TopicChallenge extends TomeChallenge {
    public abstract context: string; 
    public abstract topicId: string;
    public abstract topicCode: string;
}

/**
 * Challenges that are related to a specific Section within a Topic
 */
export abstract class SectionChallenge extends TopicChallenge {
    public abstract sectionIndex: number;
    public abstract sectionCode: string;
}

// TBD: Challenges that are not related to a single Topic
export abstract class GeneralChallenge {}