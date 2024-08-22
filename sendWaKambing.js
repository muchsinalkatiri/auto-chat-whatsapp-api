const fs = require("fs");
const axios = require("axios");
const delayRandom = require("delay-random");
const FormData = require("form-data");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

const compareFunction = (a, b) => {
  // Prioritaskan 'kota malang' untuk menjadi yang pertama
  if (a.kota === "kota malang" && b.kota !== "kota malang") return -1;
  if (a.kota !== "kota malang" && b.kota === "kota malang") return 1;

  // Urutkan berdasarkan 'kota'
  if (a.kota < b.kota) return -1;
  if (a.kota > b.kota) return 1;

  // Jika 'kota' sama, tidak ada perubahan urutan
  return 0;
};

function sendWaKambing() {
  (async () => {
    const path = "dagingKambing.csv";
    const dagingCsv = await csvToJson(path);
    const filteredArray = dagingCsv.filter(
      (item) => item.is_wa === "ada" && item.sudah == ""
    );
    filteredArray.sort(compareFunction);
    console.log(filteredArray.length);
    return;
    if (filteredArray.length == 0) {
      console.log("data tidak ada");
      return;
    }

    const nomer = filteredArray[0].nomer;
    const nama = filteredArray[0].name.toLowerCase();

    const pesan = JSON.parse(fs.readFileSync("pesan.json", "utf8"));
    const randomI = Math.floor(Math.random() * pesan.length);
    const randomPesan = pesan[randomI];

    const replacedPesan = randomPesan.replace("[nama]", nama);
    console.log(replacedPesan);

    await sendMessage(nomer, replacedPesan);

    const existingEntryIndex = dagingCsv.findIndex(
      (masterEntry) => masterEntry.nomer === nomer
    );
    dagingCsv[existingEntryIndex]["sudah"] = "sudah";

    const csvWriter = createCsvWriter({
      path: path,
      header: [
        { id: "name", title: "name" },
        { id: "nomer", title: "nomer" },
        { id: "address", title: "address" },
        { id: "kota", title: "kota" },
        { id: "keyword", title: "keyword" },
        { id: "is_wa", title: "is_wa" },
        { id: "sudah", title: "sudah" },
      ],
      append: false, // Set to true if you want to append to an existing file
    });

    // Write the updated 'masterLink' array to the CSV file
    csvWriter
      .writeRecords(dagingCsv)
      .then(() => {
        console.log("CSV file has been updated successfully.");
      })
      .catch((error) => {
        console.error("Error writing CSV file:", error);
      });

    return;
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
    console.log("status : " + response.status);
    return response;
  } catch (error) {
    console.error("Error:", error);
  }
}

const csv = require("csv-parser");

async function csvToJson(source) {
  // Create an array to store CSV data
  const linkArray = [];

  // Read the CSV file and parse its content
  await new Promise((resolve, reject) => {
    fs.createReadStream(source)
      .pipe(csv())
      .on("data", (row) => {
        // Push each row (CSV entry) into the linkArray
        linkArray.push(row);
      })
      .on("end", () => {
        // Now, linkArray contains the parsed CSV data
        resolve();
      })
      .on("error", (error) => {
        // Handle any errors during the CSV processing
        reject(error);
      });
  });

  return linkArray;
}

module.exports = {
  sendWaKambing,
};
