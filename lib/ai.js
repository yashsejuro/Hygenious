
import { GoogleGenerativeAI } from '@google/generative-ai';

// Get your API key from environment variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
    console.warn(
        '⚠️ GEMINI_API_KEY is not defined. AI analysis will fail. Please add it to your .env file.'
    );
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || '');
const geminiModel = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
});

/**
 * Analyze hygiene image using Google Gemini
 */
export async function analyzeHygieneImage(imageBase64, mimeType = 'image/jpeg') {
    if (!GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is not configured for analysis.');
    }

    try {
        console.log(`🔍 Analyzing image with Gemini 2.5 Flash (MIME: ${mimeType})...`);

        const imagePart = {
            inlineData: {
                data: imageBase64,
                mimeType: mimeType,
            },
        };

        const prompt = `
      You are an expert hygiene and safety inspector for commercial spaces (kitchens, washrooms, etc.).
      Analyze the provided image and return a JSON object with your findings.

      You MUST adhere to the following JSON schema:
      {
        "overallScore": "number (0-100)",
        "cleanliness": "number (0-100)",
        "organization": "number (0-100)",
        "safety": "number (0-100)",
        "assessment": "string (A brief, 1-2 sentence summary of your findings)",
        "issues": [
          {
            "type": "string (e.g., 'Surface Cleanliness', 'Organization', 'Safety Hazard', 'Contamination')",
            "description": "string (A specific description of the issue found)",
            "severity": "string ('Low', 'Medium', 'High', 'Critical')",
            "confidence": "number (0-100)"
          }
        ],
        "recommendations": [
          "string (A list of actionable recommendations based on the issues)"
        ]
      }

      Guidelines for your analysis:
      1.  **Scoring:**
          - 90-100 (Excellent): Near perfect, minimal issues.
          - 75-89 (Good): Generally clean, some minor areas for improvement.
          - 60-74 (Fair): Multiple issues noted that require attention.
          - 0-59 (Poor/Critical): Significant, urgent issues, potential health hazards.
      2.  **Overall Score:** This should be an average of the cleanliness, organization, and safety scores.
      3.  **Issues:** Identify 2-5 of the MOST IMPORTANT issues. If the space is excellent, list 1-2 minor maintenance or improvement points.
      4.  **Assessment:** Summarize the "why" behind the score.
      5.  **Recommendations:** Provide clear, actionable steps to fix the identified issues.

      Return ONLY the JSON object. Do not include \`\`\`json or any other text.
    `;

        const result = await geminiModel.generateContent([prompt, imagePart]);
        const response = result.response;
        let jsonString = response.text();

        // Clean the response text to remove markdown formatting if present
        jsonString = jsonString.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        // Parse the JSON string into an object
        const analysisResult = JSON.parse(jsonString);

        console.log('✅ Gemini analysis complete.');
        console.log('Overall Score:', analysisResult.overallScore);
        console.log('Issues found:', analysisResult.issues.length);

        return analysisResult;

    } catch (error) {
        console.error('❌ Gemini Analysis Error:', error.message);
        if (error.message.includes('json')) {
            console.error("Gemini did not return valid JSON. Check the prompt or model settings.");
        }
        // Fallback to a "failed analysis" object to avoid crashing the app
        return {
            overallScore: 0,
            cleanliness: 0,
            organization: 0,
            safety: 0,
            assessment: "AI analysis failed. Please check the image or system logs.",
            issues: [{
                type: "Analysis Error",
                description: `Failed to analyze image. Error: ${error.message}`,
                severity: "Critical",
                confidence: 100
            }],
            recommendations: ["Retry analysis", "Check AI service status"]
        };
    }
}
