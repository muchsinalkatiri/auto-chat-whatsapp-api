const { blasWa } = require("./blasWa");
const { sendWaKambing } = require("./sendWaKambing");
const cron = require("node-cron");

sendWaKambing();
// blasWa();
cron.schedule("50 9 * * *", function () {});
