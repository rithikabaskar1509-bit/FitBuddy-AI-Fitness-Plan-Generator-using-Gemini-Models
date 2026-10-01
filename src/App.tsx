import React, { useState, useEffect } from 'react';
import {
  Dumbbell,
  Sparkles,
  Users,
  Code2,
  FileText,
  RefreshCw,
  Send,
  CheckCircle2,
  AlertCircle,
  Copy,
  ChevronRight,
  ExternalLink,
  Flame,
  Apple,
  Clock,
  ArrowLeft,
  Search,
  BookOpen
} from 'lucide-react';

interface UserData {
  id: number;
  name: string;
  age: number;
  weight: number;
  goal: string;
  intensity: string;
  schedule?: number;
  original_plan?: string;
  updated_plan?: string | null;
  nutrition_tip?: string | null;
}

type TabType = 'home' | 'result' | 'all_users' | 'api_docs' | 'python_code';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [users, setUsers] = useState<UserData[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form state
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [goal, setGoal] = useState('');
  const [intensity, setIntensity] = useState('Medium');
  const [generating, setGenerating] = useState(false);

  // Result state
  const [currentResult, setCurrentResult] = useState<{
    user_id: number;
    username: string;
    age: number;
    weight: number;
    goal: string;
    intensity: string;
    workout_plan: string;
    nutrition_tip: string;
    updated_plan?: string | null;
    success_message?: string | null;
  } | null>(null);

  // Feedback state
  const [feedbackText, setFeedbackText] = useState('');
  const [updatingPlan, setUpdatingPlan] = useState(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  // Python code viewer state
  const [selectedPyFile, setSelectedPyFile] = useState<string>('app/routes.py');

  // Load all users on mount
  useEffect(() => {
    fetchUsers();

    // Check URL query parameters
    const params = new URLSearchParams(window.location.search);
    const view = params.get('view');
    const uId = params.get('userId');
    if (view === 'users') {
      setActiveTab('all_users');
    } else if (view === 'result' && uId) {
      loadSpecificUserResult(parseInt(uId, 10));
    }
  }, []);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error('Failed to load users', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadSpecificUserResult = async (id: number) => {
    try {
      const res = await fetch(`/api/user/${id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setCurrentResult({
            user_id: data.user.id,
            username: data.user.name,
            age: data.user.age,
            weight: data.user.weight,
            goal: data.user.goal,
            intensity: data.user.intensity,
            workout_plan: data.plan?.original_plan || 'No plan found.',
            nutrition_tip: data.plan?.nutrition_tip || 'Maintain hydration and sleep 8 hours.',
            updated_plan: data.plan?.updated_plan || null,
          });
          setActiveTab('result');
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !userId || !age || !weight || !goal) return;

    setGenerating(true);
    try {
      const payload = {
        user_id: parseInt(userId, 10),
        username,
        age: parseInt(age, 10),
        weight: parseFloat(weight),
        goal,
        intensity,
      };

      const res = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to generate plan');
      }

      const data = await res.json();
      setCurrentResult({
        user_id: data.user_id,
        username: data.username,
        age: data.age,
        weight: data.weight,
        goal: data.goal,
        intensity: data.intensity,
        workout_plan: data.workout_plan,
        nutrition_tip: data.nutrition_tip,
        updated_plan: null,
      });

      await fetchUsers();
      setActiveTab('result');
    } catch (err: any) {
      alert(`Generation Error: ${err.message}`);
    } finally {
      setGenerating(false);
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentResult || !feedbackText.trim()) return;

    setUpdatingPlan(true);
    try {
      const res = await fetch(`/api/update-plan/${currentResult.user_id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback: feedbackText }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to update plan');
      }

      const data = await res.json();
      setCurrentResult((prev) =>
        prev
          ? {
              ...prev,
              original_plan: data.original_plan || prev.workout_plan,
              updated_plan: data.updated_plan,
              nutrition_tip: data.nutrition_tip || prev.nutrition_tip,
              success_message: data.success_message || 'Your plan has been updated based on your feedback!',
            }
          : null
      );

      setFeedbackText('');
      await fetchUsers();
    } catch (err: any) {
      alert(`Update Error: ${err.message}`);
    } finally {
      setUpdatingPlan(false);
    }
  };

  const handleQuickDemo = (profile: 'alex' | 'marcus' | 'sarah') => {
    if (profile === 'alex') {
      setUsername('Alex Morgan');
      setUserId(String(Math.floor(100 + Math.random() * 899)));
      setAge('28');
      setWeight('68.5');
      setGoal('Weight Loss & Muscle Toning');
      setIntensity('Medium');
    } else if (profile === 'marcus') {
      setUsername('Marcus Chen');
      setUserId(String(Math.floor(100 + Math.random() * 899)));
      setAge('32');
      setWeight('82.0');
      setGoal('Muscle Gain & Hypertrophy');
      setIntensity('High');
    } else {
      setUsername('Sarah Jenkins');
      setUserId(String(Math.floor(100 + Math.random() * 899)));
      setAge('26');
      setWeight('59.0');
      setGoal('Flexibility & Core Strength');
      setIntensity('Low');
    }
  };

  const copyToClipboard = (text: string, sectionKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionKey);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      String(u.id).includes(q) ||
      u.goal.toLowerCase().includes(q)
    );
  });

  const pythonFilesContent: Record<string, string> = {
    'app/routes.py': `# app/routes.py
import os
from fastapi import APIRouter, Request, Form, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates

from app.database import (
    SessionLocal, User, WorkoutPlan,
    save_user, save_plan, update_plan,
    get_original_plan, get_user
)
from app.gemini_generator import generate_workout_gemini
from app.gemini_flash_generator import generate_nutrition_tip_with_flash
from app.updated_plan import update_workout_plan
from app.schemas import WorkoutRequest, UserInput, FeedbackRequest

router = APIRouter()
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TEMPLATE_DIR = os.path.join(BASE_DIR, "templates")
templates = Jinja2Templates(directory=TEMPLATE_DIR)

@router.get("/", response_class=HTMLResponse)
def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@router.post("/generate", response_class=HTMLResponse)
def generate_workout_web(
    request: Request,
    username: str = Form(...),
    user_id: int = Form(...),
    age: int = Form(...),
    weight: float = Form(...),
    goal: str = Form(...),
    intensity: str = Form(...)
):
    save_user(user_id=user_id, name=username, age=age, weight=weight, goal=goal, intensity=intensity)
    plan = generate_workout_gemini({"goal": goal, "intensity": intensity})
    save_plan(user_id, plan)
    nutrition_tip = generate_nutrition_tip_with_flash(goal)
    return templates.TemplateResponse("result.html", {
        "request": request, "username": username, "user_id": user_id,
        "age": age, "weight": weight, "goal": goal, "intensity": intensity,
        "workout_plan": plan, "nutrition_tip": nutrition_tip
    })

@router.post("/update-feedback", response_class=HTMLResponse)
def update_feedback_web(request: Request, user_id: int = Form(...), feedback: str = Form(...)):
    user = get_user(user_id)
    original = get_original_plan(user_id)
    if not original:
        raise HTTPException(status_code=404, detail="Original plan not found")
    updated = update_workout_plan(original, feedback)
    update_plan(user_id, updated)
    nutrition_tip = generate_nutrition_tip_with_flash(user.goal if user else "general fitness")
    return templates.TemplateResponse("result.html", {
        "request": request, "username": user.name if user else "User",
        "user_id": user_id, "age": user.age if user else 0,
        "weight": user.weight if user else 0.0, "goal": user.goal if user else "",
        "intensity": user.intensity if user else "", "workout_plan": original,
        "updated_plan": updated, "nutrition_tip": nutrition_tip,
        "success_message": "Your plan has been updated based on your feedback!"
    })

@router.get("/view-all-users", response_class=HTMLResponse)
def view_all_users(request: Request):
    db = SessionLocal()
    users = db.query(User).all()
    user_data = []
    for user in users:
        plan = db.query(WorkoutPlan).filter(WorkoutPlan.user_id == user.id).first()
        user_data.append({
            "id": user.id, "name": user.name, "age": user.age, "weight": user.weight,
            "goal": user.goal, "intensity": user.intensity,
            "original_plan": plan.original_plan if plan else "N/A",
            "updated_plan": plan.updated_plan if plan and plan.updated_plan else "Not updated"
        })
    db.close()
    return templates.TemplateResponse("all_users.html", {"request": request, "users": user_data})`,

    'app/gemini_generator.py': `# app/gemini_generator.py
import os
import google.generativeai as genai

API_KEY = os.getenv("GEMINI_API_KEY", "")
if API_KEY:
    genai.configure(api_key=API_KEY)

model = genai.GenerativeModel("gemini-1.5-pro")

def generate_workout_gemini(user_input):
    prompt = f"""
You are a professional fitness trainer.

Create a personalized, structured 7-day workout plan for someone with the goal of **{user_input['goal']}**, and prefers **{user_input['intensity']} intensity** workouts.

Each day must include:
- A warm-up (5-10 mins)
- Main workout (targeted exercises, sets & reps)
- Cooldown or recovery tip

Format:
Day 1:
Warm-up: ...
Main Workout: ...
Cooldown: ...
(Repeat for Day 2-7)
"""
    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Error: {e}"`,

    'app/gemini_flash_generator.py': `# app/gemini_flash_generator.py
import os
import google.generativeai as genai

API_KEY = os.getenv("GEMINI_API_KEY", "")
if API_KEY:
    genai.configure(api_key=API_KEY)

model = genai.GenerativeModel("gemini-1.5-flash")

def generate_nutrition_tip_with_flash(goal: str) -> str:
    prompt = (
        f"Give one clear, helpful nutrition or recovery tip for someone focused on '{goal}'. "
        "The tip should be practical, friendly, and easy to understand."
    )
    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        return f"Error generating tip: {str(e)}"`,

    'app/updated_plan.py': `# app/updated_plan.py
import os
import google.generativeai as genai

API_KEY = os.getenv("GEMINI_API_KEY", "")
if API_KEY:
    genai.configure(api_key=API_KEY)

model = genai.GenerativeModel("gemini-1.5-pro")

def update_workout_plan(original_plan: str, user_feedback: str) -> str:
    prompt = f"""
You are a professional fitness trainer assistant.

Here's the original 7-day workout plan:
{original_plan}

User Feedback:
"{user_feedback}"

Based on the feedback, revise the relevant parts of the workout plan. Keep the format and rest of the plan unchanged if not needed.
"""
    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        return f"Error updating plan: {e}"`,

    'app/database.py': `# app/database.py
from sqlalchemy import create_engine, Column, Integer, String, Float, Text, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker, relationship

DATABASE_URL = "sqlite:///./fitbuddy.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    age = Column(Integer, nullable=False)
    weight = Column(Float, nullable=False)
    goal = Column(String, nullable=False)
    intensity = Column(String, nullable=False)
    schedule = Column(Integer, default=7)
    plans = relationship("WorkoutPlan", back_populates="user", cascade="all, delete-orphan")

class WorkoutPlan(Base):
    __tablename__ = "workout_plans"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    original_plan = Column(Text, nullable=True)
    updated_plan = Column(Text, nullable=True)
    user = relationship("User", back_populates="plans")

def save_user(user_id: int, name: str, age: int, weight: float, goal: str, intensity: str):
    db = SessionLocal()
    existing = db.query(User).filter_by(id=user_id).first()
    if existing:
        existing.name = name; existing.age = age; existing.weight = weight
        existing.goal = goal; existing.intensity = intensity
    else:
        user = User(id=user_id, name=name, age=age, weight=weight, goal=goal, intensity=intensity, schedule=7)
        db.add(user)
    db.commit()
    db.close()

def save_plan(user_id: int, plan: str):
    db = SessionLocal()
    workout = db.query(WorkoutPlan).filter_by(user_id=user_id).first()
    if workout:
        workout.original_plan = plan
    else:
        workout = WorkoutPlan(user_id=user_id, original_plan=plan)
        db.add(workout)
    db.commit()
    db.close()

def update_plan(user_id: int, updated_text: str):
    db = SessionLocal()
    workout = db.query(WorkoutPlan).filter_by(user_id=user_id).first()
    if workout:
        workout.updated_plan = updated_text
        db.commit()
    db.close()

def get_original_plan(user_id: int):
    db = SessionLocal()
    plan = db.query(WorkoutPlan).filter(WorkoutPlan.user_id == user_id).first()
    res = plan.original_plan if plan else None
    db.close()
    return res

def get_user(user_id: int):
    db = SessionLocal()
    user = db.query(User).filter(User.id == user_id).first()
    db.close()
    return user`,

    'app/main.py': `# app/main.py
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
import os
from app.database import Base, engine
from app.routes import router

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="FitBuddy",
    description="AI-Powered Personalized 7-Day Workout & Nutrition Planner with Gemini",
    version="1.0.0"
)

os.makedirs("app/static/images", exist_ok=True)
if os.path.exists("app/static"):
    app.mount("/static", StaticFiles(directory="app/static"), name="static")

app.include_router(router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)`,

    'requirements.txt': `fastapi
uvicorn
jinja2
sqlalchemy
python-multipart
google-generativeai`,
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 lg:px-8 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight text-white">
                  Fit<span className="text-rose-500">Buddy</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Gemini Powered
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                AI 7-Day Workout & Nutrition Planner
              </p>
            </div>
          </div>

          <nav className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'home'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Dumbbell className="w-4 h-4" />
              <span>Generator</span>
            </button>

            {currentResult && (
              <button
                onClick={() => setActiveTab('result')}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === 'result'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Current Plan</span>
              </button>
            )}

            <button
              onClick={() => {
                setActiveTab('all_users');
                fetchUsers();
              }}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'all_users'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>All Users</span>
              <span className="ml-1 px-1.5 py-0.2 bg-slate-700 text-[10px] rounded-full text-slate-300">
                {users.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('api_docs')}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'api_docs'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden md:inline">API Docs (/docs)</span>
              <span className="md:hidden">Docs</span>
            </button>

            <button
              onClick={() => setActiveTab('python_code')}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'python_code'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span className="hidden md:inline">Python FastAPI Code</span>
              <span className="md:hidden">Code</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative flex flex-col">
        {/* ========================================================================= */}
        {/* TAB 1: HOME PAGE / FORM (Matches screenshots & specifications) */}
        {/* ========================================================================= */}
        {activeTab === 'home' && (
          <div
            className="flex-1 min-h-[calc(100vh-65px)] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-10 relative bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.78), rgba(15, 23, 42, 0.88)), url('/static/images/gym-bg.jpg')`,
            }}
          >
            {/* Quick Demo Pre-fill Bar */}
            <div className="w-full max-w-lg mb-4 flex items-center justify-between text-xs bg-slate-900/80 backdrop-blur-sm border border-slate-700/60 p-2.5 rounded-xl shadow-lg">
              <span className="text-slate-400 font-medium flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Quick Presets:
              </span>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickDemo('alex')}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md transition font-medium border border-slate-700"
                >
                  Alex (Weight Loss)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemo('marcus')}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md transition font-medium border border-slate-700"
                >
                  Marcus (Muscle)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemo('sarah')}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md transition font-medium border border-slate-700 hidden sm:block"
                >
                  Sarah (Flexibility)
                </button>
              </div>
            </div>

            {/* Centered White Card Form (Faithful to design) */}
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 sm:p-8 text-slate-900 border border-slate-100 transition-all">
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-slate-900 flex items-center justify-center gap-2">
                  <span className="text-blue-600">💪</span> FitBuddy - AI Workout Generator
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Generates 7-Day Plan with Warm-up, Main Workout & Gemini Flash Nutrition
                </p>
              </div>

              <form onSubmit={handleGeneratePlan} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-1">
                    Name:
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-1">
                      User ID:
                    </label>
                    <input
                      type="number"
                      required
                      value={userId}
                      onChange={(e) => setUserId(e.target.value)}
                      placeholder="e.g. 101"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-1">
                      Age:
                    </label>
                    <input
                      type="number"
                      required
                      min={10}
                      max={120}
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="e.g. 28"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-1">
                      Weight (kg):
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      min={20}
                      max={300}
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder="e.g. 68.5"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-1">
                    Fitness Goal:
                  </label>
                  <input
                    type="text"
                    required
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    placeholder="e.g., weight loss, flexibility, muscle gain"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                  />
                  <div className="flex gap-1.5 mt-1.5">
                    {['Weight Loss', 'Muscle Gain', 'Flexibility'].map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setGoal(g)}
                        className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
                      >
                        +{g}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-1">
                    Workout Intensity:
                  </label>
                  <select
                    value={intensity}
                    onChange={(e) => setIntensity(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={generating}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 text-base cursor-pointer disabled:opacity-75"
                >
                  {generating ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>Gemini is generating your plan...</span>
                    </>
                  ) : (
                    <>
                      <span>Generate Plan</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: RESULT VIEW (Matches result.html specification & screenshots) */}
        {/* ========================================================================= */}
        {activeTab === 'result' && currentResult && (
          <div
            className="flex-1 min-h-[calc(100vh-65px)] p-4 sm:p-6 lg:p-10 relative bg-cover bg-center bg-no-repeat overflow-y-auto"
            style={{
              backgroundImage: `linear-gradient(rgba(241, 245, 249, 0.94), rgba(241, 245, 249, 0.97)), url('/static/images/gym-bg.jpg')`,
            }}
          >
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Back / Action bar */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setActiveTab('home')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-slate-700 hover:text-blue-600 font-medium text-sm rounded-lg shadow-sm border border-slate-200 transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Create New Plan</span>
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setActiveTab('all_users');
                      fetchUsers();
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 font-medium text-sm rounded-lg border border-blue-200 transition"
                  >
                    <Users className="w-4 h-4" />
                    <span>View All Users</span>
                  </button>
                </div>
              </div>

              {/* White Container card */}
              <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-10 text-slate-900 border border-slate-200/80">
                {/* 1. Header */}
                <div className="text-center mb-8 pb-4 border-b border-slate-100">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center justify-center gap-2">
                    <span>🏋️</span> Your Personalized Workout Plan
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Powered by Gemini 1.5 Pro & Gemini Flash
                  </p>
                </div>

                {/* 2. User Information Section */}
                <div className="mb-8 bg-slate-50/70 p-5 rounded-xl border border-slate-100">
                  <h2 className="text-lg font-bold text-slate-900 mb-3 text-center sm:text-left">
                    User Information
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                    <div>
                      <span className="text-slate-500">Name:</span>{' '}
                      <strong className="text-slate-800">{currentResult.username}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500">User ID:</span>{' '}
                      <strong className="text-slate-800">#{currentResult.user_id}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500">Age:</span>{' '}
                      <strong className="text-slate-800">{currentResult.age} yrs</strong>
                    </div>
                    <div>
                      <span className="text-slate-500">Weight:</span>{' '}
                      <strong className="text-slate-800">{currentResult.weight} kg</strong>
                    </div>
                    <div>
                      <span className="text-slate-500">Goal:</span>{' '}
                      <span className="inline-block px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-xs font-semibold">
                        {currentResult.goal}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Intensity:</span>{' '}
                      <span className="inline-block px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-xs font-semibold">
                        {currentResult.intensity}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. Workout Plan in <pre> Block */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <Dumbbell className="w-5 h-5 text-blue-600" />
                      Workout Plan
                    </h3>
                    <button
                      onClick={() => copyToClipboard(currentResult.workout_plan, 'original')}
                      className="text-xs text-slate-500 hover:text-blue-600 flex items-center gap-1 font-medium bg-slate-100 px-2 py-1 rounded"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      {copiedSection === 'original' ? 'Copied!' : 'Copy Plan'}
                    </button>
                  </div>
                  <pre className="w-full bg-slate-50 border border-slate-200 rounded-xl p-5 text-xs sm:text-sm font-mono text-slate-800 leading-relaxed overflow-x-auto whitespace-pre-wrap max-h-[500px] overflow-y-auto">
                    {currentResult.workout_plan}
                  </pre>
                </div>

                {/* 4. Nutrition Tip (Beneath workout plan) */}
                <div className="mb-8 bg-emerald-50/80 border border-emerald-200 rounded-xl p-5">
                  <h3 className="text-base font-bold text-emerald-900 flex items-center gap-2 mb-2">
                    <span>💡</span> Gemini Flash Nutrition & Recovery Tip
                  </h3>
                  <p className="text-sm text-emerald-800 leading-relaxed font-sans">
                    {currentResult.nutrition_tip}
                  </p>
                </div>

                {/* 5. Updated Workout Plan Section (if exists) */}
                {currentResult.updated_plan && (
                  <div className="mb-8 pt-6 border-t border-slate-200">
                    {currentResult.success_message && (
                      <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-200 px-4 py-3 rounded-lg font-semibold text-sm mb-4">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        <span>{currentResult.success_message}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-bold text-blue-700 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-amber-500" />
                        Updated Workout Plan (Based on Feedback)
                      </h3>
                      <button
                        onClick={() => copyToClipboard(currentResult.updated_plan!, 'updated')}
                        className="text-xs text-slate-500 hover:text-blue-600 flex items-center gap-1 font-medium bg-slate-100 px-2 py-1 rounded"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        {copiedSection === 'updated' ? 'Copied!' : 'Copy Updated'}
                      </button>
                    </div>

                    <pre className="w-full bg-blue-50/50 border border-blue-200 rounded-xl p-5 text-xs sm:text-sm font-mono text-slate-800 leading-relaxed overflow-x-auto whitespace-pre-wrap max-h-[500px] overflow-y-auto">
                      {currentResult.updated_plan}
                    </pre>
                  </div>
                )}

                {/* 6. Feedback Form */}
                <div className="pt-6 border-t border-slate-200">
                  <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                    <span>📝</span> Share Your Feedback & Revise Plan
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">
                    Submit any adjustments (e.g., <em>"Add yoga on Day 3"</em>, <em>"Include more cardio"</em>, <em>"Focus on dumbbells only"</em>). Gemini will update your plan accordingly.
                  </p>

                  <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Your Unique User ID:
                      </label>
                      <input
                        type="number"
                        disabled
                        value={currentResult.user_id}
                        className="w-full px-3.5 py-2 bg-slate-100 border border-slate-300 rounded-lg text-slate-600 text-sm cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Your Feedback:
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        placeholder="Let us know how we can improve your plan... e.g., 'Add 20 minutes of restorative yoga on Day 3 and reduce intense leg volume on Day 5.'"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition resize-y"
                      />
                    </div>

                    <div className="flex gap-2">
                      {['Add yoga on Day 3', 'Include more cardio', 'Focus on bodyweight exercises'].map((fb) => (
                        <button
                          key={fb}
                          type="button"
                          onClick={() => setFeedbackText(fb)}
                          className="text-[11px] px-2.5 py-1 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 transition font-medium"
                        >
                          +{fb}
                        </button>
                      ))}
                    </div>

                    <button
                      type="submit"
                      disabled={updatingPlan}
                      className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-all flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-75"
                    >
                      {updatingPlan ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Gemini is updating your plan with your feedback...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Submit Feedback & Update Plan</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: ALL USERS DASHBOARD (/view-all-users specification) */}
        {/* ========================================================================= */}
        {activeTab === 'all_users' && (
          <div className="flex-1 bg-slate-100 text-slate-900 p-4 sm:p-6 lg:p-8 overflow-y-auto">
            <div className="max-w-7xl mx-auto space-y-4">
              {/* Header Bar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <span>📋</span> FitBuddy - All Users & Workout Plans
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    Live SQLite / Server DB view of registered athletes and AI workout plan versions
                  </p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search athlete or ID..."
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <button
                    onClick={fetchUsers}
                    disabled={loadingUsers}
                    title="Refresh Data"
                    className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                  >
                    <RefreshCw className={`w-4 h-4 ${loadingUsers ? 'animate-spin' : ''}`} />
                  </button>

                  <button
                    onClick={() => setActiveTab('home')}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg shadow-sm transition flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <span>+ Generate New Plan</span>
                  </button>
                </div>
              </div>

              {/* Table Container (Matching exactly the blue header screenshot) */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-sm">
                    <thead>
                      <tr className="bg-[#1e88e5] text-white font-semibold">
                        <th className="py-3 px-4 border-r border-blue-400/30 whitespace-nowrap">User ID</th>
                        <th className="py-3 px-4 border-r border-blue-400/30 whitespace-nowrap">Name</th>
                        <th className="py-3 px-4 border-r border-blue-400/30 whitespace-nowrap">Age</th>
                        <th className="py-3 px-4 border-r border-blue-400/30 whitespace-nowrap">Weight (kg)</th>
                        <th className="py-3 px-4 border-r border-blue-400/30 whitespace-nowrap">Goal</th>
                        <th className="py-3 px-4 border-r border-blue-400/30 whitespace-nowrap">Intensity</th>
                        <th className="py-3 px-4 border-r border-blue-400/30">Original Plan</th>
                        <th className="py-3 px-4">Updated Plan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-700">
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map((u, idx) => (
                          <tr
                            key={u.id}
                            className={idx % 2 === 0 ? 'bg-white hover:bg-slate-50' : 'bg-slate-50/50 hover:bg-slate-100/50'}
                          >
                            <td className="py-3 px-4 font-mono font-bold text-slate-900 border-r border-slate-200/60 align-top">
                              #{u.id}
                            </td>
                            <td className="py-3 px-4 font-semibold text-slate-900 border-r border-slate-200/60 align-top whitespace-nowrap">
                              <div>{u.name}</div>
                              <button
                                onClick={() => loadSpecificUserResult(u.id)}
                                className="text-xs text-blue-600 hover:underline flex items-center gap-0.5 mt-1"
                              >
                                View in Plan Card &rarr;
                              </button>
                            </td>
                            <td className="py-3 px-4 border-r border-slate-200/60 align-top">
                              {u.age}
                            </td>
                            <td className="py-3 px-4 border-r border-slate-200/60 align-top">
                              {u.weight}
                            </td>
                            <td className="py-3 px-4 border-r border-slate-200/60 align-top whitespace-nowrap">
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {u.goal}
                              </span>
                            </td>
                            <td className="py-3 px-4 border-r border-slate-200/60 align-top whitespace-nowrap">
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800">
                                {u.intensity}
                              </span>
                            </td>
                            <td className="py-3 px-4 border-r border-slate-200/60 align-top min-w-[280px]">
                              {u.original_plan && u.original_plan !== 'N/A' ? (
                                <pre className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs font-mono text-slate-800 leading-snug whitespace-pre-wrap max-h-48 overflow-y-auto">
                                  {u.original_plan}
                                </pre>
                              ) : (
                                <span className="text-slate-400 text-xs italic">N/A</span>
                              )}
                            </td>
                            <td className="py-3 px-4 align-top min-w-[280px]">
                              {u.updated_plan && u.updated_plan !== 'Not updated' ? (
                                <pre className="bg-emerald-50/60 border border-emerald-200 p-2.5 rounded-lg text-xs font-mono text-emerald-950 leading-snug whitespace-pre-wrap max-h-48 overflow-y-auto">
                                  {u.updated_plan}
                                </pre>
                              ) : (
                                <span className="text-slate-400 text-xs italic">Not updated</span>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={8} className="py-12 text-center text-slate-500">
                            No users found matching your criteria.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: INTERACTIVE API DOCS (/docs Swagger-style Explorer) */}
        {/* ========================================================================= */}
        {activeTab === 'api_docs' && (
          <div className="flex-1 bg-slate-900 text-slate-200 p-4 sm:p-6 lg:p-8 overflow-y-auto">
            <div className="max-w-5xl mx-auto space-y-6">
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                      <BookOpen className="w-6 h-6 text-blue-400" />
                      FitBuddy Interactive API Documentation
                    </h1>
                    <p className="text-sm text-slate-400 mt-1">
                      FastAPI & Express compatible REST endpoints. Test endpoints directly in your browser.
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono rounded-full">
                    OpenAPI 3.1.0 Ready
                  </span>
                </div>
              </div>

              {/* API 1 */}
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl overflow-hidden shadow-lg">
                <div className="flex items-center justify-between p-4 bg-slate-800 border-b border-slate-700">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 bg-blue-600 text-white text-xs font-bold font-mono rounded">
                      POST
                    </span>
                    <span className="font-mono text-sm font-semibold text-slate-200">
                      /api/generate-workout/gemini
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">Generate 7-Day Workout via Gemini</span>
                </div>
                <div className="p-4 text-xs font-mono text-slate-300 space-y-2">
                  <p className="text-slate-400 font-sans text-xs">Request JSON body:</p>
                  <pre className="bg-slate-950 p-3 rounded border border-slate-800 text-cyan-300">
{`{
  "goal": "Weight Loss",
  "intensity": "Medium"
}`}
                  </pre>
                  <p className="text-slate-400 font-sans text-xs">Response format:</p>
                  <pre className="bg-slate-950 p-3 rounded border border-slate-800 text-emerald-300">
{`{
  "model": "gemini-3.8-flash",
  "workout_plan": "Day 1:\\nWarm-up: 5 mins...\\nMain Workout: 3x12 Squats...\\nCooldown: 5 mins stretching..."
}`}
                  </pre>
                </div>
              </div>

              {/* API 2 */}
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl overflow-hidden shadow-lg">
                <div className="flex items-center justify-between p-4 bg-slate-800 border-b border-slate-700">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 bg-emerald-600 text-white text-xs font-bold font-mono rounded">
                      GET
                    </span>
                    <span className="font-mono text-sm font-semibold text-slate-200">
                      /api/nutrition-tip?goal=muscle+gain
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">Generate Flash Nutrition Tip</span>
                </div>
                <div className="p-4 text-xs font-mono text-slate-300 space-y-2">
                  <p className="text-slate-400 font-sans text-xs">Response format:</p>
                  <pre className="bg-slate-950 p-3 rounded border border-slate-800 text-emerald-300">
{`{
  "goal": "muscle gain",
  "nutrition_tip": "Consume 30-40g of protein and complex carbohydrates within 60 minutes post-workout."
}`}
                  </pre>
                </div>
              </div>

              {/* API 3 */}
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl overflow-hidden shadow-lg">
                <div className="flex items-center justify-between p-4 bg-slate-800 border-b border-slate-700">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 bg-blue-600 text-white text-xs font-bold font-mono rounded">
                      POST
                    </span>
                    <span className="font-mono text-sm font-semibold text-slate-200">
                      /api/generate-plan
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">Save User, Generate Plan & Tip</span>
                </div>
                <div className="p-4 text-xs font-mono text-slate-300 space-y-2">
                  <p className="text-slate-400 font-sans text-xs">Request JSON body:</p>
                  <pre className="bg-slate-950 p-3 rounded border border-slate-800 text-cyan-300">
{`{
  "user_id": 105,
  "username": "Diana Prince",
  "age": 29,
  "weight": 65.0,
  "goal": "endurance",
  "intensity": "High"
}`}
                  </pre>
                </div>
              </div>

              {/* API 4 */}
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl overflow-hidden shadow-lg">
                <div className="flex items-center justify-between p-4 bg-slate-800 border-b border-slate-700">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 bg-purple-600 text-white text-xs font-bold font-mono rounded">
                      POST
                    </span>
                    <span className="font-mono text-sm font-semibold text-slate-200">
                      /api/update-plan/101
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">Update Plan with Feedback</span>
                </div>
                <div className="p-4 text-xs font-mono text-slate-300 space-y-2">
                  <p className="text-slate-400 font-sans text-xs">Request JSON body:</p>
                  <pre className="bg-slate-950 p-3 rounded border border-slate-800 text-cyan-300">
{`{
  "feedback": "Add yoga on Day 3 and swap barbell deadlifts for dumbbells"
}`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: PYTHON CODE EXPLORER */}
        {/* ========================================================================= */}
        {activeTab === 'python_code' && (
          <div className="flex-1 bg-slate-950 text-slate-200 p-4 sm:p-6 lg:p-8 flex flex-col overflow-hidden">
            <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-xl">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Code2 className="w-5 h-5 text-blue-400" />
                    Python FastAPI Project Source Files
                  </h2>
                  <p className="text-xs text-slate-400">
                    The complete codebase is available locally in the <code className="text-blue-400">/fitbuddy</code> directory.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyToClipboard(pythonFilesContent[selectedPyFile], selectedPyFile)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition flex items-center gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedSection === selectedPyFile ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                </div>
              </div>

              {/* File selector pill list */}
              <div className="flex flex-wrap gap-1.5 p-2 bg-slate-900/60 border border-slate-800 rounded-lg">
                {Object.keys(pythonFilesContent).map((fileName) => (
                  <button
                    key={fileName}
                    onClick={() => setSelectedPyFile(fileName)}
                    className={`px-3 py-1 text-xs font-mono rounded-md transition ${
                      selectedPyFile === fileName
                        ? 'bg-blue-600 text-white font-bold'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {fileName}
                  </button>
                ))}
              </div>

              {/* Code display block */}
              <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
                <div className="bg-slate-800/80 px-4 py-2 border-b border-slate-700 flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>{selectedPyFile}</span>
                  <span>Python / UTF-8</span>
                </div>
                <pre className="flex-1 p-4 text-xs font-mono text-slate-200 overflow-auto whitespace-pre leading-relaxed bg-slate-950">
                  {pythonFilesContent[selectedPyFile]}
                </pre>
              </div>

              {/* Setup commands guide */}
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-xs space-y-1 font-mono text-slate-400">
                <div className="font-bold text-slate-200 font-sans mb-1">Local Execution Steps:</div>
                <p><span className="text-blue-400 font-bold">1.</span> python -m venv fitbuddy-env</p>
                <p><span className="text-blue-400 font-bold">2.</span> source fitbuddy-env/bin/activate  <span className="text-slate-500">(or fitbuddy-env\Scripts\activate on Windows)</span></p>
                <p><span className="text-blue-400 font-bold">3.</span> pip install fastapi uvicorn jinja2 sqlalchemy python-multipart google-generativeai</p>
                <p><span className="text-blue-400 font-bold">4.</span> cd fitbuddy && uvicorn app.main:app --reload</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-3 px-6 text-center text-xs text-slate-500">
        FitBuddy &bull; Powered by Google Gemini &bull; Full-Stack React + Express & Python FastAPI Architecture
      </footer>
    </div>
  );
}
