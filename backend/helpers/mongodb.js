var mongoose = require("mongoose");
var path = require("path");

require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const init = async () => {
  try {
    const uri = process.env.DB_URL;

    if (!uri) {
      throw new Error(
        'Missing DB_URL. Create backend/.env and set DB_URL, for example: DB_URL="mongodb://localhost:27017/maindb"'
      );
    }

    await mongoose.connect(uri);
    console.log("connected");
  } catch (err) {
    console.error("error: " + err.stack);
    process.exit(1);
  }
};

module.exports = init;
