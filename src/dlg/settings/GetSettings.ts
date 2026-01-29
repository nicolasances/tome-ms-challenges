import { Request } from "express";
import { ExecutionContext, TotoDelegate, UserContext } from "toto-api-controller";
import { ControllerConfig } from "../../Config";
import { SettingsStore } from "../../store/SettingsStore";
import { Settings } from "../../model/settings/Settings";

export class GetSettings implements TotoDelegate {

    async do(req: Request, userContext: UserContext, execContext: ExecutionContext): Promise<{settings: Settings}> {

        const config = execContext.config as ControllerConfig;

        const client = await config.getMongoClient();
        const db = client.db(config.getDBName());

        const settings = await new SettingsStore(db, execContext).loadSettings();

        return { settings: settings };
    }
}