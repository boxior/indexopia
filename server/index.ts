import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import {Request, Response} from "express";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/health", (_req: Request, res: Response) => {
    res.send("Crypto Index API");
    return;
});

app.listen(PORT, () => {
    console.log(`Express server running on port ${PORT}`);
});
