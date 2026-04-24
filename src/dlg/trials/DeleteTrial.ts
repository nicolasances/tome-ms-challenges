import { Request } from "express";
import { TotoDelegate, TotoRequest, UserContext, ValidationError } from "totoms";
import { ControllerConfig } from "../../Config";
import { TrialsStore } from "../../store/TrialsStore";

/**
 * Deletes a trial.
 * 
 * If the deleted trial was the "current" trial (not marked as attempt), 
 * it will unmark the most recent "attempt" trial to maintain data consistency.
 */
export class DeleteTrial extends TotoDelegate<DeleteTrialRequest, DeleteTrialResponse> {

    async do(req: DeleteTrialRequest, userContext?: UserContext): Promise<DeleteTrialResponse> {

        const config = this.config as ControllerConfig;
        const db = await config.getMongoDb(config.getDBName());
        const trialsStore = new TrialsStore(db, config);

        // Get the trial before deleting to check if we need to unmark previous attempts
        const trial = await trialsStore.getTrialById(req.trialId);

        if (!trial) throw new ValidationError(400, "Trial not found");

        // Delete the trial
        await trialsStore.deleteTrial(req.trialId);

        // If the deleted trial was NOT marked as attempt, it means it was the "current" trial
        // In that case, we need to unmark the most recent attempt to restore consistency
        if (!trial.attempt) {
            await trialsStore.unmarkMostRecentAttempt(trial.challengeId);
        }

        return { id: req.trialId };
    }

    parseRequest(req: Request): DeleteTrialRequest {
        return { trialId: req.params.trialId };
    }

}

interface DeleteTrialRequest extends TotoRequest {
    trialId: string;
}

interface DeleteTrialResponse {
    id: string;
}