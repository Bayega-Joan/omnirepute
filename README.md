# OmniRepute

**AI-Powered Brand Reputation Analysis Platform**

OmniRepute is a comprehensive brand reputation analysis platform that leverages AI to provide deep insights into brand performance across multiple data sources. Built with a modern tech stack including React, Node.js, Google Cloud Platform, and Fivetran connectors, it transforms raw social media and news data into actionable brand intelligence.

## 🎯 Overview

OmniRepute analyzes brand mentions from various sources (Reddit, GDELT news data) and uses Google's Gemini AI to generate comprehensive reputation reports. The platform provides:

- **Reputation Scoring**: 0-100 score with detailed rationale
- **Key Insights**: AI-generated insights about brand perception
- **Sentiment Analysis**: What users love and hate about your brand
- **Actionable Strategies**: Data-driven recommendations for improvement
- **Complaint Response Templates**: Suggested responses to common complaints

## 🏗️ Architecture

### Frontend (React + TypeScript)
- **Location**: `/src/`
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS
- **Key Components**:
  - `BrandInputForm`: Brand name input and analysis trigger
  - `AnalysisDisplay`: Comprehensive results visualization
  - `SourceFilter`: Data source selection (All, Reddit, GDELT)
  - `ScoreCard`: Reputation score display
  - `SectionCard`: Organized insights presentation

### Backend (Node.js + Express)
- **Location**: `/omni-repute-backend/`
- **Framework**: Express.js
- **AI Integration**: Google Gemini API (Vertex AI)
- **Database**: Google BigQuery
- **Key Features**:
  - CORS-enabled API endpoints
  - Structured AI response schemas
  - BigQuery integration for data retrieval
  - Error handling and logging

### Data Pipeline (Fivetran Connectors)
- **Location**: `/connectors/`
- **Reddit Connector**: Fetches brand mentions from Reddit posts
- **GDELT Connector**: Processes global news and media mentions
- **Features**:
  - Incremental data loading
  - Rate limiting and error handling
  - Configurable lookback periods
  - Brand term filtering

## 🔧 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Vite** for build tooling
- **Custom SVG icons** for UI elements

### Backend
- **Node.js** with Express
- **Google Cloud BigQuery** for data storage
- **Google Gemini AI** for analysis
- **CORS** for cross-origin requests

### Data Infrastructure
- **Fivetran SDK** for connector development
- **Reddit API** for social media data
- **GDELT Project** for global news data
- **Google Cloud Platform** for hosting and data processing

## 📊 Data Sources

### Reddit
- **Scope**: Brand mentions across Reddit posts and comments
- **Data Points**: Post content, scores, comments, subreddit context
- **Update Frequency**: Configurable (default: 7-day lookback)
- **Rate Limiting**: Built-in API rate limiting compliance

### GDELT (Global Database of Events, Language, and Tone)
- **Scope**: Global news media and online content
- **Data Points**: News articles, tone analysis, themes, locations
- **Update Frequency**: 15-minute intervals
- **Coverage**: Worldwide news sources and online media

## 🚀 Use Cases

### Brand Monitoring
- Track brand mentions across social media and news
- Monitor sentiment trends over time
- Identify emerging reputation issues

### Competitive Analysis
- Compare brand reputation against competitors
- Identify market positioning opportunities
- Track industry sentiment patterns

### Crisis Management
- Early detection of reputation threats
- Rapid response to negative sentiment
- Damage assessment and recovery planning

### Marketing Intelligence
- Understand what resonates with audiences
- Identify content themes that drive positive sentiment
- Optimize messaging based on audience feedback

## 🛠️ Setup & Installation

### Prerequisites
- Node.js (v16+)
- Python (v3.8+)
- Google Cloud Platform account
- Fivetran account (for connectors)
- Reddit API credentials

### Environment Variables
```bash
# Backend (.env)
GOOGLE_APPLICATION_CREDENTIALS=./gcp-credentials.json
GCP_PROJECT_ID=your-gcp-project-id
API_KEY=your-gemini-api-key
PORT=3001

# Reddit Connector
REDDIT_CLIENT_ID=your-reddit-client-id
REDDIT_CLIENT_SECRET=your-reddit-client-secret
REDDIT_USER_AGENT=your-app-name/1.0
```

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd omnirepute
   ```

2. **Install frontend dependencies**
   ```bash
   cd src
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd ../omni-repute-backend
   npm install
   ```

4. **Setup connectors**
   ```bash
   cd ../connectors/reddit
   pip install -r requirements.txt
   
   cd ../gdelt
   pip install -r requirements.txt
   ```

5. **Configure BigQuery**
   - Create a BigQuery dataset: `omnirepute`
   - Set up tables for brand mentions
   - Configure Fivetran connectors to populate data

## 🎮 Usage

### Running the Application

1. **Start the backend server**
   ```bash
   cd omni-repute-backend
   npm start
   ```

2. **Start the frontend development server**
   ```bash
   cd src
   npm run dev
   ```

3. **Access the application**
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:3001`

### Using the Platform

1. **Enter Brand Name**: Input the brand you want to analyze
2. **Select Data Source**: Choose between All sources, Reddit only, or GDELT only
3. **Generate Analysis**: Click analyze to get AI-powered insights
4. **Review Results**: Explore reputation score, insights, and recommendations

## 📈 API Endpoints

### POST `/api/analyze`
Analyzes brand reputation based on available data.

**Request Body:**
```json
{
  "brandName": "Tesla",
  "source": "all"
}
```

**Response:**
```json
{
  "reputationScore": 85,
  "scoreRationale": "Strong positive sentiment across social media and news sources",
  "keyInsights": [
    "Innovation leadership in electric vehicles",
    "Strong brand loyalty among customers",
    "Occasional quality concerns mentioned"
  ],
  "improvementStrategies": [
    {
      "title": "Quality Assurance",
      "description": "Address quality concerns through improved manufacturing processes"
    }
  ],
  "whatUsersLove": ["Innovation", "Performance", "Sustainability"],
  "whatUsersHate": ["Build quality", "Service wait times"],
  "complaintResponses": [
    {
      "complaint": "Long service wait times",
      "suggestedResponse": "We're expanding our service network to reduce wait times..."
    }
  ]
}
```

## 🔄 Data Flow

1. **Data Collection**: Fivetran connectors fetch data from Reddit and GDELT
2. **Data Storage**: Raw data is stored in Google BigQuery
3. **Analysis Request**: User submits brand analysis request via frontend
4. **Data Retrieval**: Backend queries BigQuery for relevant brand mentions
5. **AI Processing**: Gemini AI analyzes the data and generates insights
6. **Results Display**: Frontend presents structured analysis results

## 🎨 UI Components

- **BrandHeader**: Application title and description
- **BrandInputForm**: Brand name input with analysis trigger
- **SourceFilter**: Data source selection interface
- **AnalysisDisplay**: Comprehensive results visualization
- **ScoreCard**: Reputation score with visual indicators
- **SectionCard**: Organized insights and recommendations
- **LoadingState**: Analysis progress indicator
- **ErrorDisplay**: Error handling and user feedback

## 🔒 Security & Privacy

- **CORS Configuration**: Restricted to allowed origins
- **API Key Management**: Environment variable protection
- **Data Privacy**: No personal data storage
- **Rate Limiting**: Built-in API rate limiting

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📞 Support

For questions, issues, or contributions, please open an issue on GitHub or contact the development team.
