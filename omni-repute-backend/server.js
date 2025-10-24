require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { BigQuery } = require('@google-cloud/bigquery');
const { GoogleGenAI, Type } = require('@google/genai');

const app = express();
const port = process.env.PORT || 3001;


const allowedOrigins = [
    'http://localhost:3000', //local React dev
    'http://localhost:5173', // local Vite dev 
    'http://127.0.0.1:5173', // local Vite dev
    'https://your-gcp-project-id.web.app' // Firebase
];

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
};

app.use(cors(corsOptions));

app.use(express.json());

const bigquery = new BigQuery({ projectId: process.env.GCP_PROJECT_ID });
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY, vertexai: true });

// the Gemini API response structure
const responseSchema = {
    type: Type.OBJECT,
    properties: {
        reputationScore: {
            type: Type.INTEGER,
            description: 'A score from 0 to 100 representing the brand\'s overall reputation based on the provided data. 100 is best, 0 is worst.'
        },
        scoreRationale: {
            type: Type.STRING,
            description: 'A brief one-sentence explanation for the given reputation score, referencing the data source.'
        },
        keyInsights: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'A list of 3-5 bullet-point key insights about the brand\'s public perception derived from the data.'
        },
        improvementStrategies: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING }
                },
                required: ['title', 'description']
            },
            description: 'A list of actionable strategies to improve brand reputation, based on the analysis.'
        },
        whatUsersLove: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'A list of specific positive themes or comments found in the data.'
        },
        whatUsersHate: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'A list of specific negative themes, complaints, or dislikes found in the data.'
        },
        complaintResponses: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    complaint: { type: Type.STRING, description: 'A common type of complaint identified from the data.' },
                    suggestedResponse: { type: Type.STRING, description: 'A suggested, empathetic, and constructive response to that type of complaint.' }
                },
                required: ['complaint', 'suggestedResponse']
            },
            description: 'Examples of common complaints from the data and suggested brand responses.'
        }
    },
    required: ['reputationScore', 'scoreRationale', 'keyInsights', 'improvementStrategies', 'whatUsersLove', 'whatUsersHate', 'complaintResponses']
};

// The main analysis endpoint
app.post('/api/analyze', async (req, res) => {
    const { brandName, source } = req.body;

    if (!brandName) {
        return res.status(400).json({ message: 'Brand name is required.' });
    }

    console.log(`Starting analysis for brand: "${brandName}" from source: "${source}"`);

    try {
        // 1. Query BigQuery to get a sample of mentions
        console.log('Querying BigQuery for data sample...');
        const query = `
            SELECT
                source,
                full_text
            FROM \`omnirepute.omnirepute_curated_omnirepute_curated.brand_mentions\`
            WHERE
                brand = @brandName
                ${source !== 'all' ? "AND source = @source" : ""}
            LIMIT 700; -- Get a representative sample to avoid huge data transfer
        `;

        const options = {
            query: query,
            location: 'US',
            params: { brandName: brandName, source: source },
        };

        const [rows] = await bigquery.query(options);
        console.log(`Found ${rows.length} mentions in BigQuery.`);

        if (rows.length === 0) {
            return res.status(404).json({ message: `No data found for "${brandName}" from source "${source}".` });
        }

        // 2. Call Gemini API with the data for analysis
        console.log('Sending data to Gemini for analysis...');
        const analysisPrompt = `
            Based on the following sample of ${rows.length} public mentions for the brand "${brandName}" from the "${source}" source, please perform a comprehensive brand reputation analysis.
            
            Data Sample:
            ${JSON.stringify(rows.slice(0, 50))} // Send a smaller slice to fit within prompt limits

            Please provide your analysis in the required JSON format.
        `;

        const result = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { role: 'user', parts: [{ text: analysisPrompt }] },
            config: {
                responseMimeType: 'application/json',
                responseSchema: responseSchema,
            },
        });
        
        const jsonText = result.text.trim();
        const analysisResult = JSON.parse(jsonText);

        console.log('Analysis complete. Sending response to client.');
        res.json(analysisResult);

    } catch (error) {
        console.error('An error occurred during analysis:', error);
        res.status(500).json({ message: 'An internal server error occurred.' });
    }
});

app.listen(port, () => {
    console.log(`OmniRepute backend listening on http://localhost:${port}`);
});
