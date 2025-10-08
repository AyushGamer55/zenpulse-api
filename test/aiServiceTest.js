import dotenv from "dotenv";
dotenv.config();

import {
  generatePepTalk,
  analyzeSentiment,
  detectBurnout,
  summarizeEntries,
} from "../services/aiService.js";

async function testAI() {
  const sampleEntries = [
    { entry_date: "2024-06-01", mood: 3, journal: "Feeling okay." },
    { entry_date: "2024-06-02", mood: 2, journal: "A bit tired." },
    { entry_date: "2024-06-03", mood: 1, journal: "Very stressed." },
    { entry_date: "2024-06-04", mood: 2, journal: "Still tired." },
    { entry_date: "2024-06-05", mood: 4, journal: "Better today." },
  ];

  console.log("Testing generatePepTalk...");
  const pepTalk = await generatePepTalk(2, "Feeling stressed", "gentle");
  console.log("Pep Talk:", pepTalk);

  console.log("Testing analyzeSentiment...");
  const sentiment = await analyzeSentiment(2, "Feeling stressed");
  console.log("Sentiment:", sentiment);

  console.log("Testing detectBurnout...");
  const burnout = detectBurnout(sampleEntries);
  console.log("Burnout detected:", burnout);

  console.log("Testing summarizeEntries...");
  const summary = await summarizeEntries(sampleEntries);
  console.log("Summary:", summary);
}

testAI().catch(console.error);
