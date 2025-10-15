const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const connTOMongo = async () => {
   try {
          await mongoose.connect(process.env.MONGO_URI, {
              useNewUrlParser: true,
              useUnifiedTopology: true,
          });
          isConnected = true;
      }  catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connTOMongo;
//nodemon use- when you make changes and update something then you dont need to restart the server agaain it will restart by itself
