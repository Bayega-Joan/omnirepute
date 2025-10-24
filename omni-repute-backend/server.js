require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { BigQuery } = require('@google-cloud/bigquery');
// const { GoogleGenAI, Type } = require('@google/genai'); // Commented out for deployment

const app = express();
const port = process.env.PORT || 3001;


const allowedOrigins = [
    'http://localhost:3000', //local React dev
    'http://localhost:5173', // local Vite dev 
    'http://localhost:5174', // local Vite dev (alternative port)
    'http://127.0.0.1:5173', // local Vite dev
    'http://127.0.0.1:5174', // local Vite dev (alternative port)
    'https://your-gcp-project-id.web.app' // Firebase
];

// Manual CORS handling for development
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    next();
});

app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        service: 'omnirepute-backend'
    });
});

// Initialize BigQuery with credentials
const bigqueryOptions = { projectId: process.env.GCP_PROJECT_ID };
if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    bigqueryOptions.keyFilename = process.env.GOOGLE_APPLICATION_CREDENTIALS;
}

const bigquery = new BigQuery(bigqueryOptions);
// const ai = new GoogleGenAI({ apiKey: process.env.API_KEY }); // Commented out for deployment

// Gemini API response structure (commented out for deployment)
// const responseSchema = { ... };

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

        // 2. Generate mock analysis response for deployment
        console.log('Generating analysis response...');
        
        // Mock analysis result for deployment
        const analysisResult = {
            reputationScore: Math.floor(Math.random() * 40) + 60, // Random score between 60-100
            scoreRationale: `Based on ${rows.length} mentions from ${source}, ${brandName} shows a generally positive reputation with room for improvement.`,
            keyInsights: [
                `${brandName} is frequently mentioned in discussions about innovation`,
                `Users appreciate the company's forward-thinking approach`,
                `Some concerns about market volatility and competition`,
                `Strong brand recognition across multiple platforms`
            ],
            improvementStrategies: [
                {
                    title: "Enhance Customer Communication",
                    description: "Improve transparency and regular updates to stakeholders"
                },
                {
                    title: "Strengthen Market Position",
                    description: "Focus on competitive advantages and unique value propositions"
                }
            ],
            whatUsersLove: [
                "Innovation and technological advancement",
                "Visionary leadership",
                "Market disruption capabilities"
            ],
            whatUsersHate: [
                "Market volatility concerns",
                "Communication gaps during changes",
                "Competition from established players"
            ],
            complaintResponses: [
                {
                    complaint: "Market volatility concerns",
                    suggestedResponse: "We understand concerns about market fluctuations. Our long-term vision remains focused on sustainable growth and innovation."
                },
                {
                    complaint: "Communication gaps",
                    suggestedResponse: "Thank you for the feedback. We're committed to improving our communication channels and providing more regular updates."
                }
            ]
        };

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
