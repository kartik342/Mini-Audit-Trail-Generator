import express from "express";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";

const app = express();
app.use(cors());
app.use(express.json());


let versions = [];      // Stores all version history objects
let previousText = "";  // Stores last saved text (used for diff)

const PORT = 5000;

app.get("/versions", (req, res) => {
    res.json(versions); // send all versions to frontend
});

app.post("/save-version", (req, res) => {
    const { text } = req.body;

    console.log("Received text:", text);

    const oldWords = previousText.split(/\s+/).filter(w => w.trim() !== "");
    const newWords = text.split(/\s+/).filter(w => w.trim() !== "");

    const addedWords = newWords.filter(word => !oldWords.includes(word));

    const removedWords = oldWords.filter(word => !newWords.includes(word));

    const versionObj = {
        id: uuidv4(),
        timestamp: new Date().toLocaleString(),
        addedWords,
        removedWords,
        oldLength: oldWords.length,
        newLength: newWords.length,
        fullText: text 
    };

    versions.unshift(versionObj);

    previousText = text

    // We will add diff logic here in the next step
    res.json({ message: "Version saved", version: versionObj });
});

app.delete("/clear-history", (req, res) => {
  versions = [];
  previousText = "";
  res.json({ message: "History cleared" });
});


app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
