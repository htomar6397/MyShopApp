
import express from "express";
import path from "path";
import cookieParser from "cookie-parser";

import cors from "cors";
import connectDB from "./config/db.js";
import productRoutes from "./routes/productRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import { config } from "dotenv";
import cloudinary from "cloudinary";
const port = 5000;
config({ path: "./src/config/config.env" });
connectDB();

const app = express();

// app.use(
//   cors({
//     origin: [
//       "http://localhost:3001",
//       "http://localhost:3000",
    
//     ],
//     credentials: true,
//   })
// );

app.use(express.json({ limit: "10mb" }));

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);


app.get("/api/config/razorpay", (req, res) =>
  res.send({ key: process.env.RAZORPAY_API_KEY })
);

// if (process.env.NODE_ENV === "production") {
  const __dirname = path.resolve();
//   app.use("/uploads", express.static("/var/data/uploads"));
  app.use(express.static(path.join(__dirname, "/frontend/build")));

  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname, "frontend", "build", "index.html"))
  );
// } else {
  // const __dirname = path.resolve();
  // app.use("/uploads", express.static(path.join(__dirname, "/uploads")));
  
// }
 app.get("/", (req, res) => {
   res.send("API is running....");
 });
app.use(notFound);
app.use(errorHandler);

app.listen(port, () =>
  console.log(`Server running on port ${port}`)
);
