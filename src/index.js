const express = require("express");
const sharp = require("sharp");
const fileUpload = require("express-fileupload");
const fs = require("fs");
const imageHash = require("node-image-hash");
const path = require("path");
const sizeOf = require("image-size");

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

  console.log(`Received file: ${file.name} ${file.mimetype}`);
  const { hash } = await imageHash.hash(file.data, 8, "hex");
  fs.mkdir(`public/${hash}/`, { recursive: true }, (err) => {
    if (err) {
      return console.error(err);
    }
  });

  const sizes = req.query.sizes ? req.query.sizes.split(",").map((s) => parseInt(s, 10)) : SIZES;
  const formats = req.query.formats ? JSON.parse(req.query.formats) : FORMATS;
  console.log(`Using sizes ${sizes}`);
  console.log(`Using formats ${JSON.stringify(formats)}`);

  const promises = [];
  const sharpStream = sharp({ failOn: "none" });

  sizes.forEach((size) => {
    formats.forEach(({ format, options }) => {
      console.log(`Pushed a task into the queue: ${hash}-${size}.${format}`);
      promises.push(sharpStream.clone().resize(size).toFormat(format, options).toFile(`public/${hash}/${hash}-${size}.${format}`));
    });
  });
  // pipe the received file into the sharp pipeline
  sharp(file.data).pipe(sharpStream);
  console.log("Starting the conversion tasks...");

  const thumbBuffer = await sharp(file.data).resize(40).toFormat("jpeg", { quality: 30 }).toBuffer();
  const thumbnail = thumbBuffer.toString("base64");
  const thumbnailDimensions = sizeOf(file.data);

  const converted = await Promise.all(promises).catch((err) => {
    console.error("Error processing files, let's clean it up", err);
    try {
      fs.rmdirSync(path.join(__dirname, `public/${hash}/`));
    } catch (e) {}
  });
  console.log("Finished processing images.");
  const images = converted.map((conv) => {
    const name = `${hash}-${conv.width}.${conv.format}`;
    const mimeType = `image/${conv.format}`;
    const href = `/${hash}/${name}`;

    return { ...conv, href, name, mimeType };
  });

  return res.status(200).json({
    images,
    thumbnail: { value: thumbnail, width: thumbnailDimensions.width, height: thumbnailDimensions.height },
  });
});

app.listen(3000);
console.log("Express started on port 3000");
