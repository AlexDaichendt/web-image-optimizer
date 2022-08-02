const express = require("express");
const sharp = require("sharp");
const fileUpload = require("express-fileupload");
const fs = require("fs");
const imageHash = require("node-image-hash");
const path = require("path");
const sharpStream = sharp({ failOn: "none" });

const promises = [];

const app = express();

app.use(fileUpload());
app.use(express.static("public"));

const SIZES = [360, 720, 1280, 1920];
const FORMATS = [{ format: "webp", options: { effort: 6, quality: 75 } }];

app.post("/", async (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send("No files were uploaded.");
  }

  let file = req.files.data;
  const { hash } = await imageHash.hash(file.data, 8, "hex");
  fs.mkdir(`public/${hash}/`, { recursive: true }, (err) => {
    if (err) {
      return console.error(err);
    }
  });
  SIZES.forEach((size) => {
    FORMATS.forEach(({ format, options }) => {
      promises.push(
        sharpStream.clone().resize(size).toFormat(format, options).toFile(`public/${hash}/${hash}-${size}.${format}`)
      );
    });
  });
  // pipe the received file into the sharp pipeline
  sharp(file.data).pipe(sharpStream);

  const converted = await Promise.all(promises).catch((err) => {
    console.error("Error processing files, let's clean it up", err);
    try {
      fs.rmdirSync(path.join(__dirname, `public/${hash}/`));
    } catch (e) {}
  });

  const images = converted.map((conv) => ({ ...conv, href: `/${hash}/${hash}-${conv.width}.${conv.format}` }));

  return res.status(200).json(images);
});

app.listen(3000);
console.log("Express started on port 3000");
