const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use(`/${process.env.UPLOAD_DIR}`, express.static(process.env.UPLOAD_DIR));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error(err));

// Ensure upload directory exists
if (!fs.existsSync(process.env.UPLOAD_DIR)) {
  fs.mkdirSync(process.env.UPLOAD_DIR);
}

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, process.env.UPLOAD_DIR),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname)
});

const upload = multer({ storage });

// Schema
const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  image: String
});

const Product = mongoose.model("Product", productSchema);

// CREATE
app.post("/products", upload.single("image"), async (req, res) => {
  const product = await Product.create({
    name: req.body.name,
    price: req.body.price,
    image: req.file
  ? `${process.env.BASE_URL}:${process.env.PORT}/${req.file.path}`
  : null

  });
  res.json(product);
});

// READ
app.get("/products", async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

// UPDATE
app.put("/products/:id", upload.single("image"), async (req, res) => {
  const update = {
    name: req.body.name,
    price: req.body.price,
  };
  if (req.file) {
    update.image = `${process.env.BASE_URL}/${req.file.path}`;
  }
  const product = await Product.findByIdAndUpdate(req.params.id, update, { new: true });
  res.json(product);
});

// DELETE
app.delete("/products/:id", async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

app.listen(process.env.PORT, () =>
  console.log(`Server running on port ${process.env.PORT}`)
);
