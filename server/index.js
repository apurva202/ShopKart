if (process.env.NODE_ENV !== "production") {
  const dns = require("node:dns");
  dns.setServers(["1.1.1.1"]);
}

const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const customerRoutes = require("./routes/customer.routes");
const productRoutes = require("./routes/product.routes");
const wishlistRoutes = require("./routes/wishlist.routes");
const cartRoutes = require("./routes/cart.routes");

const app = express();
const Port = 8085;

dotenv.config();

const dbUrl = process.env.dbUrl;

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.use("/customers", customerRoutes);
app.use("/products", productRoutes);
app.use("/wishlist", wishlistRoutes);
app.use("/cart", cartRoutes);

async function startServer() {
  try {
    await mongoose.connect(dbUrl);

    console.log("DB Connection OK");

    app.listen(Port, () => {
      console.log(`Server Started on port: ${Port}`);
    });
  } catch (err) {
    console.log(err);
  }
}

startServer();
