require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors({
  origin: "*",
  methods: ["GET", "POST"]
}));

app.use(express.json());


// Initialize the client (Note: no { apiKey: ... } object here)
const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY
});


const menuContext = `
You are the AI Waiter. Use this detailed menu to answer:

STARTERS:
- Caesar Salad (150 kcal): Contains Dairy, Egg, Anchovies. (Vegetarian if ordered without anchovies)
- Garlic Bread (200 kcal): Contains Wheat, Dairy. (Vegetarian)
- Soup of the Day (120 kcal): Usually Tomato-based. (Vegan, Gluten-Free)

MAINS:
- Grilled Salmon (550 kcal): Contains Fish. (Gluten-Free)
- Pasta Carbonara (650 kcal): Contains Wheat, Dairy, Egg, Pork.
- Ribeye Steak (700 kcal): Contains Beef. (Gluten-Free)
- Vegetarian Lasagna (480 kcal): Contains Wheat, Dairy, Celery. (Vegetarian)

DESSERTS:
- Chocolate Cake (320 kcal): Contains Wheat, Dairy, Egg. (Vegetarian)
- Cheesecake (380 kcal): Contains Dairy, Wheat. PROCESSED IN A FACILITY WITH NUTS. (Vegetarian)
- Tiramisu (350 kcal): Contains Dairy, Wheat, Egg, Caffeine.
- Sorbet (150 kcal): Fruit-based. (Vegan, Gluten-Free, Nut-Free)

POLICIES:
- Vegan Options: Only "Soup of the Day" and "Sorbet" are strictly vegan.
- Nut Allergy: While no dishes list nuts as a direct ingredient, the Cheesecake is processed in a facility with nuts.
- General: If unsure, always advise the guest to speak with the floor manager.
`;

app.post('/chat', async (req, res) => {
    try {
        const { message, history } = req.body;

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        const responseStream = await ai.models.generateContentStream({
            model: "gemini-2.5-flash", 
            contents: history ? [...history, { role: 'user', parts: [{ text: message }] }] : [{ role: 'user', parts: [{ text: message }] }],
            config: {
                systemInstruction: menuContext
            }
        });

        for await (const chunk of responseStream) {
            // Some versions of the new SDK wrap text in 'text' property, some in 'candidates'
            const text = chunk.text || (chunk.candidates && chunk.candidates[0].content.parts[0].text);
            if (text) {
                res.write(`data: ${JSON.stringify({ text })}\n\n`);
            }
        }

        res.write('data: [DONE]\n\n');
        res.end();

    } catch (error) {
        console.error("Detailed API Error:", error);
        // If it's still a 404, we send a clear message to the frontend
        res.write(`data: ${JSON.stringify({ error: "Model version not supported. Try gemini-1.5-flash-latest" })}\n\n`);
        res.end();
    }
});

// Start the server
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

//Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

//
app.get("/faq", (req, res) => {
  res.json({ message: "FAQ endpoint is active" });
});
