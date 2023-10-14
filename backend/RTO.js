
import express from 'express';
const app = express();
import fileupload from 'express-fileupload';
import cors from 'cors';
import router from "./route/route.js"
import './connecttion/conn.js'
import path from "path"
import env from "dotenv"
const port = process.env.PORT || 3535;
env.config()


import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, 'public')));

app.use(
    cors({
        origin: "*",
        methods: ["GET", "POST", "DELETE"],
    })
);

app.use(fileupload())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use(router)

app.use(express.static('../Client/build'))
app.get("*", (req, res) => {
    res.sendFile(path.resolve('../Client/build', 'index.html'))
})


app.listen(port, () => {
    console.log(`server Running on ${port}`);
})
