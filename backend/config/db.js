import mongoose from "mongoose";

 const connectDB = async () => {
   try {
     const conn = await mongoose.connect(
       process.env.ENVIROMENT === "production"
         ? process.env.MONGO_URI
         : "mongodb://127.0.0.1:27017/ecom"
     );
     console.log(`MongoDB Connected: ${conn.connection.host}`);
   } catch (error) {
     console.error(`Error: ${error.message}`);
     process.exit(1);
   }
 };

 export default connectDB;