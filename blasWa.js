const MPasirKucing = require("./models/MPasirKucing.js");
const fs = require("fs");
const axios = require("axios");
const delayRandom = require("delay-random");
const FormData = require("form-data");
const { send: sendTelegram } = require("./helpers/telegram.js");

function blasWa() {
  (async () => {
    let imagePath = "assets/brosur.jpeg";
    const pasirKucing = await MPasirKucing.findAll({
      where: {
        is_wa: 1,
        status: 1,
        keyword: "petshop",
      },
      order: [["kota", "DESC"]],
      limit: 2,
      raw: true,
    });

    const pesan = JSON.parse(fs.readFileSync("pesan.json", "utf8"));

    //   const text = "";
    for (let i = 0; i < pasirKucing.length; i++) {
      const item = pasirKucing[i];
      const kota = item.kota.toLowerCase();
      const splittedKota = kota.split(" ");
      // console.log(splittedKota);

      const randomI = Math.floor(Math.random() * pesan.length);
      const randomPesan = pesan[randomI];

      const replacedPesan = randomPesan.replace("[nama]", item.name);

      const cleanedReplacedPesan = removeSymbolsAndLowerCase(replacedPesan);
      let finalPesan = cleanedReplacedPesan;
      splittedKota.forEach((row) => {
        finalPesan = finalPesan.replace(row, "");
      });

      // console.log(finalPesan);

      // let response = await sendMessage(item.nomer, finalPesan);
      let response = await sendMessage(
        item.nomer,
        "Assalamualaikum, selamat siang kak"
      );

      if (response.status == 200) {
        await delayRandom(1000, 3000);
        await sendMessage(
          item.nomer,
          `Apa ini langsung dengan owner nya ${item.name} ?`
        );
        await delayRandom(1000, 3000);
        await sendMessage(
          item.nomer,
          `Perkenalkan kita dari Pabrik Pasir Kucing, Insan Makmur Abadi Grup, barangkali kakak minat untuk membuat pasir kucing dengan merk sendiri, kita bisa bantu butakan`
        );
        await delayRandom(1000, 3000);
        await sendMessage(
          item.nomer,
          `Zeolit dan bentonit kita siap produksi skala besar.`
        );
        await delayRandom(1000, 3000);
        await sendMessage(
          item.nomer,
          `Bisa di save dulu nomor kita ya kak, barangkali suatu saat mau order, terimakasih`
        );
        await delayRandom(1000, 3000);
        await sendMessage("087756404524", "", imagePath);
        // await updateStatusTo1(item.id);
        // sendTelegram(
        // `<b>Terkirim</b>\nTujuan : ${item.nomer}\nPesan : ${finalPesan}`
        // );
      }
      await delayRandom(120000, 300000);
    }
  })().catch((err) => console.error(err));
}
async function sendMessage(number, message, imagePath) {
  try {
    // Membuat objek FormData untuk mengirim data dalam bentuk form-data
    const formData = new FormData();

    // Menambahkan nomor dan pesan ke form-data
    formData.append("number", number);
    formData.append("message", message);

    if (imagePath) {
      const imageStream = fs.createReadStream(imagePath);
      formData.append("image", imageStream);
    }

    // Konfigurasi header untuk form-data
    const config = {
      headers: {
        ...formData.getHeaders(), // Mengambil header yang diperlukan untuk form-data
      },
    };

    // Mengirim permintaan dengan form-data
    const response = await axios.post(
      "http://localhost:8000/send-message",
      formData,
      config
    );

    // Mengembalikan respons jika diperlukan
    return response;
  } catch (error) {
    console.error("Error:", error);
  }
}

async function updateStatusTo1(itemId) {
  try {
    await MPasirKucing.update(
      { status: 1 }, // New column value
      { where: { id: itemId } } // Condition to match
    );
    console.log(`Status updated to 1 for item id ${itemId}`);
  } catch (error) {
    console.error("Error updating status:", error);
  }
}

function removeSymbolsAndLowerCase(text) {
  const cleanedText = text.replace(/[^\w\s]/gi, "").toLowerCase();
  const cleanedTextWithoutDoubleSpace = cleanedText.replace(/\s{2,}/g, " ");
  return cleanedTextWithoutDoubleSpace;
}

module.exports = {
  blasWa,
};
