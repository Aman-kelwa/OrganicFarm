import ai from "../config/gemini.js";

export const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    const prompt = `
You are OrganicFarm AI.

Your job is to answer ONLY questions related to agriculture.

Topics you can answer:
- Farming
- Crops
- Organic Farming
- Fertilizers
- Soil
- Irrigation
- Agricultural Machinery
- Tractors
- Rental Equipment
- Seeds
- Livestock
- Government Agriculture Schemes
- Plant Diseases
- Weather for Farming

Rules:

1. Reply in the SAME language as the user's question.
   - If the user asks in Hindi → reply in Hindi.
   - If the user asks in English → reply in English.
   - If the user asks in Hinglish → reply in Hinglish.

2. Be friendly and easy to understand.

3. Give practical farming advice.

4. Keep answers between 100-300 words.

5. If the user asks something unrelated to farming, reply:

"I am OrganicFarm AI 🌱.
I can only answer questions related to farming, agriculture, crops, irrigation, fertilizers, machinery and agricultural equipment."

User Question:

${message}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    res.status(200).json({
      success: true,
      reply: response.text,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
