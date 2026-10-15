if (process.env.NODE_ENV !== "production") {
  const dns = require("node:dns");
  dns.setServers(["1.1.1.1"]);
}

const path = require("path");
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const customerRoutes = require("./routes/customer.routes");
const productRoutes = require("./routes/product.routes");
const wishlistRoutes = require("./routes/wishlist.routes");
const cartRoutes = require("./routes/cart.routes");
const orderRoutes = require("./routes/order.routes");

const app = express();
const Port = 8085;

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
app.use("/orders", orderRoutes);

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
