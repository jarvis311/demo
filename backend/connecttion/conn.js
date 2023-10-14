import mongoose from "mongoose";
import env from "dotenv"
env.config()
mongoose.connect(`mongodb://127.0.0.1:27017/${process.env.DATABASE_MONGOOSE}`)
    .then(() => {
        console.log('connation for RTO Mongoose');
    }).catch((err) => {
        console.log(err);
    })
