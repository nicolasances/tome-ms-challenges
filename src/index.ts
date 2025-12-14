import { TotoAPIController } from "toto-api-controller";
import { ControllerConfig } from "./Config";

const api = new TotoAPIController(new ControllerConfig({ apiName: "tome-ms-challenges" }), { basePath: '/tomechallenges' });

// api.path('POST', '/something', new PostSomething())

api.init().then(() => {
    api.listen()
});