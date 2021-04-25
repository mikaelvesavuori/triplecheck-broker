"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateDbKey = void 0;
function calculateDbKey(item) {
    const { type, name, version } = item;
    const key = `${type}#${name}@${version}`;
    return key;
}
exports.calculateDbKey = calculateDbKey;
//# sourceMappingURL=calculateDbKey.js.map