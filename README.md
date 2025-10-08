# ZenPulse API

A personal wellness dashboard API that tracks mood, productivity, and habits with AI-powered motivational support and insights.

## 🚀 Features

### Core Functionality
- **Daily Mood Tracking**: Log your mood on a 1-5 scale with optional journal entries
- **Productivity Metrics**: Track completed tasks and pomodoro sessions
- **AI-Powered Insights**: Get personalized pep talks and sentiment analysis
- **Burnout Detection**: Automatic monitoring for concerning mood patterns
- **Weekly Summaries**: AI-generated analysis of your wellness trends

### AI Features
- **Smart Pep Talks**: Context-aware motivational messages based on your mood and journal content
- **Real-Time Chat**: Conversational AI assistant that considers your current emotional state
- **Sentiment Analysis**: Automatic analysis of journal entries for emotional insights
- **Weekly Reports**: Comprehensive summaries with growth opportunities and encouragement

## 🛠️ Technology Stack

- **Backend**: Node.js with Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT with bcrypt password hashing
- **AI Providers**: OpenAI (primary) + Mistral AI (fallback)
- **Architecture**: RESTful API with modular service structure

## 📋 Prerequisites

- Node.js (v16+)
- PostgreSQL database
- OpenAI API key (recommended) or Mistral AI API key
- Environment variables configured

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd zenpulse-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   PORT=5000
   JWT_SECRET=your-super-secret-jwt-key
   DATABASE_URL=postgresql://username:password@localhost:5432/zenpulse_db
   
   # AI Providers (at least one required)
   OPENAI_API_KEY=your-openai-api-key
   MISTRAL_API_KEY=your-mistral-api-key
   ```

4. **Initialize the database**
   ```bash
   npm run db:init
   ```

5. **Start the server**
   ```bash
   npm start
   # or for development
   npm run dev
   ```

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword",
  "displayName": "John Doe"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

### Entries Endpoints

#### Add Daily Entry
```http
POST /api/entries
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "mood": 4,
  "journal": "Had a productive day at work",
  "tasksCompleted": 5,
  "pomodoros": 8,
  "notes": "Completed project milestone"
}
```

#### Get Recent Entries
```http
GET /api/entries
Authorization: Bearer <jwt-token>
```

#### Get Burnout Stats
```http
GET /api/entries/stats
Authorization: Bearer <jwt-token>
```

#### Get Weekly Summary
```http
GET /api/entries/weekly-summary
Authorization: Bearer <jwt-token>
```

#### Auto-Update Mood
```http
POST /api/entries/auto-update-mood
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "mood": 3
}
```

### Chat Endpoints

#### Send Chat Message
```http
POST /api/chat
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "message": "I'm feeling stressed about work"
}
```

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  display_name TEXT,
  pep_tone TEXT DEFAULT 'gentle',
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Entries Table
```sql
CREATE TABLE entries (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Core data
  mood INT CHECK (mood >= 1 AND mood <= 5),
  mood_auto_updated BOOLEAN DEFAULT false,
  journal TEXT,
  tasks_completed INT DEFAULT 0,
  pomodoros INT DEFAULT 0,
  notes TEXT,

  -- AI insights
  sentiment TEXT,
  ai_pep_talk TEXT,
  burnout_risk BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE (user_id, entry_date)
);
```

## 🤖 AI Integration

The API intelligently uses multiple AI providers for optimal performance and cost efficiency:

- **OpenAI (GPT-4o-mini)**: Primary provider for high-quality sentiment analysis and pep talks
- **Mistral AI**: Free alternative fallback with excellent performance
- **Caching System**: Reduces API calls with 5-minute response caching
- **Graceful Fallbacks**: Keyword-based analysis when AI services are unavailable

## 🧪 Testing

### Database Reset
```bash
npm run db:reset
```

### AI Service Testing
Visit `http://localhost:5000/api/test-ai` to test AI functionality with sample data.

## 📁 Project Structure

```
zenpulse-api/
├── controllers/          # Route handlers
│   ├── authController.js
│   └── entriesController.js
├── middleware/          # Express middleware
│   └── auth.js
├── routes/              # API route definitions
│   ├── auth.js
│   ├── entries.js
│   ├── chat.js
│   └── testAi.js
├── services/            # Business logic services
│   └── aiService.js
├── sql/                 # Database schema
│   └── schema.sql
├── test/                # Test utilities
└── server.js            # Main application entry
```

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- CORS protection
- Input validation
- SQL injection prevention with parameterized queries

## 🚦 API Response Format

### Success Response
```json
{
  "message": "ZenPulse API running 🚀",
  "time": "2024-01-15T10:30:00.000Z"
}
```

### Error Response
```json
{
  "error": "Invalid credentials"
}
```

## 📈 Performance Optimizations

- **AI Response Caching**: Reduces API costs and improves response times
- **Database Connection Pooling**: Efficient database connection management
- **Parallel AI Processing**: Concurrent sentiment analysis and pep talk generation
- **Graceful Degradation**: Service continues with limited functionality when AI providers fail

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🙏 Acknowledgments

- OpenAI for providing excellent AI services
- Mistral AI for cost-effective alternatives
- The Express.js and Node.js communities

---

**Built with ❤️ for mental wellness and productivity tracking**
```