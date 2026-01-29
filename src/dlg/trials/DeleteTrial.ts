import { Request } from "express";
import { ExecutionContext, TotoDelegate, UserContext, ValidationError } from "toto-api-controller";
import { ControllerConfig } from "../../Config";
import { TrialsStore } from "../../store/TrialsStore";
import { TrialFactory } from "../../model/TrialFactory";

/**
 * Deletes a trial.
 * 
 * If the deleted trial was the "current" trial (not marked as attempt), 
 * it will unmark the most recent "attempt" trial to maintain data consistency.
 */
export class DeleteTrial implements TotoDelegate {

    async do(req: Request, userContext: UserContext, execContext: ExecutionContext): Promise<any> {

        const config = execContext.config as ControllerConfig;

        const client = await config.getMongoClient();
        const db = client.db(config.getDBName());
        const trialsStore = new TrialsStore(db, execContext);

        const trialId = req.params.trialId;

        // Get the trial before deleting to check if we need to unmark previous attempts
        const trial = await trialsStore.getTrialById(trialId);

        if (!trial) throw new ValidationError(400, "Trial not found");

        // Delete the trial
        await trialsStore.deleteTrial(trialId);

        // If the deleted trial was NOT marked as attempt, it means it was the "current" trial
        // In that case, we need to unmark the most recent attempt to restore consistency
        if (!trial.attempt) {
            await trialsStore.unmarkMostRecentAttempt(trial.challengeId);
        }

        return { id: trialId };
    }

}