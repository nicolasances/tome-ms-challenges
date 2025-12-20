import { TotoAPI, TotoAPIRequest, ValidationError } from "toto-api-controller"
import { v4 as uuidv4 } from 'uuid';

export class GaleBrokerAPI extends TotoAPI {

    async postTask(taskId: string, taskInputData: any): Promise<AgentTaskResponse> {

        return this.post(new TotoAPIRequest('/tasks', {
            command: { command: "start" },
            correlationId: uuidv4(),
            taskId: taskId,
            taskInputData: taskInputData
        } as AgentTaskRequest), AgentTaskResponse)
}

}

export interface AgentTaskRequest {
    correlationId?: string;             // Correlation ID to group related tasks together.
    command: { command: "start" | "resume" };
    taskId: string;                     // Unique identifier of the task to be executed. E.g. "text.summarize"
    taskInputData?: any;                // Input data needed for the task execution.
}

export class AgentTaskResponse {
    stopReason: StopReason  // Reason why the task execution stopped.
    taskOutput?: any;       // Output data produced by the task execution.

    constructor({ stopReason, taskOutput }: AgentTaskResponse) {
        this.stopReason = stopReason;
        this.taskOutput = taskOutput;
    }

    static fromParsedHTTPResponseBody(body: any): AgentTaskResponse {

        if ("code" in body && body.code == 400) throw new ValidationError(400, body.message);

        return new AgentTaskResponse({
            stopReason: body.stopReason,
            taskOutput: body.taskOutput
        });
    }
}

export type StopReason = "completed" | "failed" | "subtasks";
