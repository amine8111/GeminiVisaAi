# GeminiVisaAI - Visa Application Assistant

A production-ready web application to assist users with visa applications, featuring:
- User authentication (JWT)
- Profile management (personal, passport, employment, financial, travel history)
- AI-powered visa eligibility prediction (rule-based expert system)
- Document metadata tracking
- PDF form generation for visa applications

## Tech Stack
- **Frontend**: React.js + Vite + Tailwind CSS
- **Backend**: Python Flask + SQLAlchemy
- **Database**: SQLite (dev) / PostgreSQL (prod)
- **Authentication**: JWT

## Project Structure
```
visa-ai/
├── backend/              # Flask API
│   ├── app/
│   │   ├── models.py     # Database models
│   │   ├── routes.py     # API endpoints
│   │   └── services/     # Business logic
│   ├── config.py         # Configuration
│   ├── requirements.txt  # Python dependencies
│   └── run.py           # Entry point
├── src/                  # React frontend
│   ├── pages/           # Page components
│   ├── context/         # Auth context
│   └── components/      # UI components
├── dist/                # Built frontend
└── package.json         # Frontend dependencies
```

## Setup & Running

### Backend (Development)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python run.py
```
Backend runs at http://localhost:5000

### Frontend (Development)
```bash
cd visa-ai
npm install
npm run dev
```
Frontend runs at http://localhost:5173

### Production Build
```bash
npm run build
```
Deploy the `dist/` folder to any static hosting (Netlify, Vercel, etc.)

## API Endpoints
- `POST /api/register` - Register new user
- `POST /api/login` - Login
- `GET /api/user/profile` - Get profile
- `PUT /api/user/profile` - Update profile
- `POST /api/applications` - Create application
- `GET /api/applications` - List applications
- `GET /api/applications/:id/eligibility` - Check eligibility
- `GET /api/documents` - List documents
- `POST /api/documents/upload` - Add document
- `GET /api/generate-schengen-form/:id` - Generate PDF

## Environment Variables

### Backend (.env)
```
SECRET_KEY=your-secret-key
DATABASE_URL=sqlite:///visaai.db
SENDGRID_API_KEY=your-sendgrid-key
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```
VITE_BACKEND_URL=http://localhost:5000
```

## Deployment

### Backend (Render.com)
1. Push backend folder to GitHub
2. Create PostgreSQL database on Render
3. Create Python web service
4. Set environment variables

### Frontend (Netlify)
1. Run `npm run build`
2. Upload dist folder or connect to GitHub
3. Set VITE_BACKEND_URL to your backend URL