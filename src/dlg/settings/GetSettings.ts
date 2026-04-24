import { Request } from "express";
import { TotoDelegate, TotoRequest, UserContext } from "totoms";
import { ControllerConfig } from "../../Config";
import { SettingsStore } from "../../store/SettingsStore";
import { Settings } from "../../model/settings/Settings";

export class GetSettings extends TotoDelegate<GetSettingsRequest, GetSettingsResponse> {

    async do(req: GetSettingsRequest, userContext?: UserContext): Promise<GetSettingsResponse> {

        const config = this.config as ControllerConfig;
        const db = await config.getMongoDb(config.getDBName());

        const settings = await new SettingsStore(db, config).loadSettings();

        return { settings: settings };
    }

    parseRequest(req: Request): GetSettingsRequest {
        return {};
    }

}

interface GetSettingsRequest extends TotoRequest {}

interface GetSettingsResponse {
    settings: Settings;
}