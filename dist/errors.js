"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleServerErrors = exports.handleCustomErrors = void 0;
const handleCustomErrors = (err, req, res, next) => {
    if (err.status) {
        res.status(err.status).json({ msg: err.message });
    }
    else {
        next(err);
    }
};
exports.handleCustomErrors = handleCustomErrors;
const handleServerErrors = (err, req, res, next) => {
    console.error(err);
    res.status(500).json({ msg: 'Internal server error' });
};
exports.handleServerErrors = handleServerErrors;
//# sourceMappingURL=errors.js.map