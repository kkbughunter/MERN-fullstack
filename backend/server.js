const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");

// Use correct env automatically
dotenv.config({
  path: process.env.NODE_ENV === "production" ? ".env.production" : ".env"
});

const app = express();

app.use(cors());
app.use(express.json());

// Absolute upload folder path
const uploadPath = path.join(__dirname, process.env.UPLOAD_DIR);

// Make uploads folder public
app.use(`/${process.env.UPLOAD_DIR}`, express.static(uploadPath));

// Mongo
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.error(err));

// Ensure uploads directory exists
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// Multer Setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "_"));
  }
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
  const imageUrl = req.file
    ? `${process.env.BASE_URL}/${process.env.UPLOAD_DIR}/${req.file.filename}`
    : null;

  const product = await Product.create({
    name: req.body.name,
    price: req.body.price,
    image: imageUrl
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
    price: req.body.price
  };

  if (req.file) {
    update.image = `${process.env.BASE_URL}/${process.env.UPLOAD_DIR}/${req.file.filename}`;
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
