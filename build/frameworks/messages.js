"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.warnUpdateTestsMissingRequiredVariables = exports.warnUpdateContractsMissingRequiredVariables = exports.errorDeleteDataMissingParams = exports.errorUpdateDataMissingData = exports.errorGetDataMissingKey = exports.errorRouterMissingParams = void 0;
exports.errorRouterMissingParams = `Missing "method" and/or "pathname" in router()!`;
exports.errorGetDataMissingKey = `Missing "key" in getData()!`;
exports.errorUpdateDataMissingData = `Missing "data" in updateData()!`;
exports.errorDeleteDataMissingParams = `Missing "type" and/or "serviceName" in deleteData()!`;
exports.warnUpdateContractsMissingRequiredVariables = `Missing one or more of required variables "type", "name", "version" and/or "data"! Skipping adding this contract...`;
exports.warnUpdateTestsMissingRequiredVariables = `Missing one or more of required variables "type", "name", and/or "version"! Skipping adding this contract...`;
//# sourceMappingURL=messages.js.map