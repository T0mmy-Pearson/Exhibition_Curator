"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const PORT = process.env.PORT || 9090;
app_1.app.listen(PORT, () => {
    console.log(`Exhibition Curator API listening on port ${PORT}...`);
});
//# sourceMappingURL=server.js.map