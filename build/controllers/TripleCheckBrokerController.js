"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TripleCheckBrokerController = void 0;
const TripleCheckBroker_1 = require("../entities/TripleCheckBroker");
async function TripleCheckBrokerController(request, body, repository) {
    try {
        const broker = TripleCheckBroker_1.createNewBroker(repository);
        const { responseData, status } = await broker.router(request, body);
        const headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
            'Access-Control-Allow-Headers': '*'
        };
        return { responseData, status, headers };
    }
    catch (error) {
        console.error(error);
        return { responseData: error.message, status: 500 };
    }
}
exports.TripleCheckBrokerController = TripleCheckBrokerController;
//# sourceMappingURL=TripleCheckBrokerController.js.map