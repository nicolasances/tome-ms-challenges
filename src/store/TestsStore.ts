import { Db } from "mongodb";
import { ExecutionContext } from "toto-api-controller";
import { ControllerConfig } from "../Config";

export class TestsStore {

    private trials: string;

    constructor(private db: Db, private execContext: ExecutionContext) {

        this.trials = (execContext.config as ControllerConfig).getCollections().trials;

    }

}