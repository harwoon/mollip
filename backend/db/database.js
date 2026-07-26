import mongoose from "mongoose"
import {config} from "../config.mjs"

export async function connectDB() {
    return mongoose.connect(config.db.host, {
        dbName: "Mollip"
    }).then(() => {
        console.log("DB 연결됨");
    }).catch((err) => {
        console.error("DB Connection Error: ", err);
    });
}