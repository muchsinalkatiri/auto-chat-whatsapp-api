const M_GogleMap = require("./models/GoogleMaps.js");
const M_Kota = require("./models/M_kota.js");
const db = require("./config/Database.js");
const Op = require("sequelize").Op;
const { phoneNumberFormatter } = require("./helpers/global");

const util = require("util");
const delay = util.promisify(setTimeout);

const { Client, LocalAuth } = require("whatsapp-web.js");
var qrcode = require("qrcode-terminal");

let ready = false;
const client = new Client({
  puppeteer: { headless: true },
  authStrategy: new LocalAuth(),
  args: [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-extensions",
    "--disable-gpu",
    "--disable-accelerated-2d-canvas",
    "--no-first-run",
    "--no-zygote",
    "--disable-dev-shm-usage",
    "--single-process",
  ],
});

client.initialize();

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true }, function (qrcode) {
    console.log(qrcode);
  });
});

client.on("loading_screen", (percent, message) => {
  console.log("LOADING SCREEN", percent, message);
});

client.on("authenticated", (session) => {
  console.log("AUTHENTICATED");
});

client.on("auth_failure", (msg) => {
  console.error("AUTHENTICATION FAILURE", msg);
  ready = false;
});

client.on("message", (msg) => {
  if (msg.body == "!ping") {
    msg.reply("pong");
  }
});

const checkRegisteredNumber = async function (number) {
  const isRegistered = await client.isRegisteredUser(number);
  return isRegistered;
};
client.on("ready", async () => {
  console.log("Client is ready!");
  let is_wa = 0;

  await db.sync({
    alter: true,
  });
  const data = await M_GogleMap.findAll({
    raw: true,
    attributes: ["id", "nomer"],
    where: {
      is_wa: null,
      nomer: { [Op.ne]: null },
    },
    // limit: 100,
    order: [["nomer", "DESC"]],
  });
  console.log(`Jumlah data: ${data.length}`);
  for (const obj of data) {
    console.log(obj.nomer);

    const isRegisteredNumber = await checkRegisteredNumber(
      phoneNumberFormatter(obj.nomer)
    );
    if (isRegisteredNumber) {
      is_wa = 1;
      console.log("ada wa");
    } else {
      is_wa = 0;
      console.log("gaada wa");
    }
    await M_GogleMap.update(
      { is_wa },
      {
        where: {
          id: obj.id,
        },
      }
    );
    await delay(5000);
  }
});
// (async () => {
//   await delay(30000);
//   if (ready) {
//     console.log("jalan");
//     await db.sync({
//       alter: true,
//     });
//     const data = await M_GogleMap.findAll({
//       raw: true,
//       attributes: ["nomer"],
//       where: {
//         nomer: { [Op.not]: null },
//       },
//       limit: 5,
//     });

//     // data.forEach(async (obj) => {
//     const checkRegisteredNumber = async function (number) {
//       const isRegistered = await client.isRegisteredUser(number);
//       return isRegistered;
//     };
//     const isRegisteredNumber = await checkRegisteredNumber(
//       "6287756404524@c.us"
//     );

//     // console.log(obj.nomer);
//     if (isRegisteredNumber) {
//       console.log("ada wa");
//     } else {
//       console.log("gaada wa");
//     }
//     // });
//     //   console.log(data);
//   }
// })();
