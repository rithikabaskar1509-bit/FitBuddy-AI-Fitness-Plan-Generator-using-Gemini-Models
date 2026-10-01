import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'fitbuddy_db.json');

export interface UserRecord {
  id: number;
  name: string;
  age: number;
  weight: number;
  goal: string;
  intensity: string;
  schedule: number;
  createdAt: string;
}

export interface WorkoutPlanRecord {
  id: number;
  user_id: number;
  original_plan: string;
  updated_plan: string | null;
  nutrition_tip: string | null;
  updatedAt: string;
}

interface DatabaseSchema {
  users: UserRecord[];
  plans: WorkoutPlanRecord[];
}

function ensureDbFile(): DatabaseSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    const initialData: DatabaseSchema = {
      users: [
        {
          id: 101,
          name: "Alex Morgan",
          age: 28,
          weight: 68.5,
          goal: "Weight Loss",
          intensity: "Medium",
          schedule: 7,
          createdAt: new Date().toISOString(),
        },
        {
          id: 102,
          name: "Marcus Chen",
          age: 32,
          weight: 79.0,
          goal: "Muscle Gain",
          intensity: "High",
          schedule: 7,
          createdAt: new Date().toISOString(),
        }
      ],
      plans: [
        {
          id: 1,
          user_id: 101,
          original_plan: `Day 1:\nWarm-up: 7 mins light jogging & dynamic leg swings\nMain Workout: 3x12 Bodyweight Squats, 3x10 Push-ups, 3x15 Walking Lunges, 20 mins interval cycling\nCooldown: 5 mins static hamstring and calf stretching\n\nDay 2:\nWarm-up: 5 mins jump rope & arm circles\nMain Workout: 3x12 Dumbbell Deadlifts, 3x10 Dumbbell Rows, 3x30s Plank holds\nCooldown: Child's pose and deep diaphragmatic breathing\n\nDay 3:\nWarm-up: 8 mins incline treadmill walk\nMain Workout: HIIT circuit (Burpees, Mountain Climbers, Kettlebell Swings) - 4 rounds of 45s work / 15s rest\nCooldown: Full body quad and shoulder stretch\n\nDay 4:\nWarm-up: 6 mins mobility flow & cat-cow\nMain Workout: Active recovery - 35 mins brisk walking or easy swimming\nCooldown: Gentle foam rolling for calves and lower back\n\nDay 5:\nWarm-up: 5 mins jumping jacks & hip openers\nMain Workout: 3x12 Goblet Squats, 3x10 Overhead Dumbbell Press, 3x12 Glute Bridges\nCooldown: Hamstring & glute stretches\n\nDay 6:\nWarm-up: 7 mins rower machine warmup\nMain Workout: 25 mins tempo cardio run + 3x15 Hanging knee raises\nCooldown: 5 mins cool walking & thoracic spine rotations\n\nDay 7:\nWarm-up: 5 mins gentle neck and shoulder circles\nMain Workout: Full body restorative stretch & 20 mins leisure walk\nCooldown: Deep meditative breathing and hydration`,
          updated_plan: `Day 1:\nWarm-up: 7 mins light jogging & dynamic leg swings\nMain Workout: 3x12 Bodyweight Squats, 3x10 Push-ups, 3x15 Walking Lunges, 20 mins interval cycling\nCooldown: 5 mins static hamstring and calf stretching\n\nDay 2:\nWarm-up: 5 mins jump rope & arm circles\nMain Workout: 3x12 Dumbbell Deadlifts, 3x10 Dumbbell Rows, 3x30s Plank holds\nCooldown: Child's pose and deep diaphragmatic breathing\n\nDay 3 (Updated with Yoga):\nWarm-up: 5 mins gentle Vinyasa Sun Salutations\nMain Workout: 35 mins Vinyasa Yoga flow focusing on hip openers, core stability, and gentle strength postures (Warrior II, Triangle pose, Downward Dog to Plank transitions)\nCooldown: 8 mins Savasana and guided mindful breathing\n\nDay 4:\nWarm-up: 6 mins mobility flow & cat-cow\nMain Workout: Active recovery - 35 mins brisk walking or easy swimming\nCooldown: Gentle foam rolling for calves and lower back\n\nDay 5:\nWarm-up: 5 mins jumping jacks & hip openers\nMain Workout: 3x12 Goblet Squats, 3x10 Overhead Dumbbell Press, 3x12 Glute Bridges\nCooldown: Hamstring & glute stretches\n\nDay 6:\nWarm-up: 7 mins rower machine warmup\nMain Workout: 25 mins tempo cardio run + 3x15 Hanging knee raises\nCooldown: 5 mins cool walking & thoracic spine rotations\n\nDay 7:\nWarm-up: 5 mins gentle neck and shoulder circles\nMain Workout: Full body restorative stretch & 20 mins leisure walk\nCooldown: Deep meditative breathing and hydration`,
          nutrition_tip: "Focus on drinking at least 3 liters of water daily, especially 500ml before meals to support metabolic rate and satiety.",
          updatedAt: new Date().toISOString(),
        },
        {
          id: 2,
          user_id: 102,
          original_plan: `Day 1 (Chest & Triceps):\nWarm-up: 8 mins rowing & band dislocates\nMain Workout: Barbell Bench Press 4x8, Incline Dumbbell Press 3x10, Cable Flyes 3x12, Tricep Rope Pushdowns 3x12\nCooldown: Chest doorway stretch & tricep extension stretch\n\nDay 2 (Back & Biceps):\nWarm-up: 6 mins dynamic arm swings & scapular pull-ups\nMain Workout: Conventional Deadlift 4x6, Barbell Bent-over Rows 4x8, Lat Pulldowns 3x10, Barbell Bicep Curls 3x10\nCooldown: Lat stretch on rack & child's pose\n\nDay 3 (Legs & Calves):\nWarm-up: 8 mins stationary bike & leg swings\nMain Workout: Barbell Back Squats 4x8, Romanian Deadlifts 3x10, Leg Press 3x12, Standing Calf Raises 4x15\nCooldown: Quad foam rolling & seated hamstring stretch\n\nDay 4 (Shoulders & Abs):\nWarm-up: 5 mins light overhead press & lateral raises\nMain Workout: Standing Overhead Press 4x8, Dumbbell Lateral Raises 4x12, Face Pulls 3x15, Hanging Leg Raises 3x12\nCooldown: Cross-body shoulder stretch & cobra stretch\n\nDay 5 (Upper Body Hypertrophy):\nWarm-up: 6 mins elliptical machine\nMain Workout: Weighted Dips 3x8, Pull-ups 3x8, Incline Dumbbell Flyes 3x12, Incline Dumbbell Curls 3x12\nCooldown: Upper body stretching flow\n\nDay 6 (Lower Body Hypertrophy):\nWarm-up: 7 mins dynamic mobility\nMain Workout: Front Squats 3x8, Walking Dumbbell Lunges 3x12 per leg, Hamstring Curls 3x12, Seated Calf Raises 3x15\nCooldown: 8 mins deep leg stretching\n\nDay 7 (Rest & Recovery):\nWarm-up: 5 mins gentle walk\nMain Workout: Full rest day - light 20 mins stroll to promote blood flow\nCooldown: Hydration and 8+ hours quality sleep`,
          updated_plan: null,
          nutrition_tip: "Target 1.8g to 2.2g of protein per kg of body weight, and consume 30-40g of protein within 90 minutes post-workout for optimal muscle protein synthesis.",
          updatedAt: new Date().toISOString(),
        }
      ]
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading database file, reinitializing", err);
    const fallback: DatabaseSchema = { users: [], plans: [] };
    fs.writeFileSync(DB_FILE, JSON.stringify(fallback, null, 2), 'utf-8');
    return fallback;
  }
}

function writeDbFile(data: DatabaseSchema): void {
  ensureDbFile();
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export function saveUser(
  user_id: number,
  name: string,
  age: number,
  weight: number,
  goal: string,
  intensity: string
): UserRecord {
  const db = ensureDbFile();
  const existingIndex = db.users.findIndex((u) => u.id === user_id);

  if (existingIndex >= 0) {
    db.users[existingIndex] = {
      ...db.users[existingIndex],
      name,
      age,
      weight,
      goal,
      intensity,
    };
    writeDbFile(db);
    return db.users[existingIndex];
  } else {
    const newUser: UserRecord = {
      id: user_id,
      name,
      age,
      weight,
      goal,
      intensity,
      schedule: 7,
      createdAt: new Date().toISOString(),
    };
    db.users.push(newUser);
    writeDbFile(db);
    return newUser;
  }
}

export function savePlan(user_id: number, original_plan: string, nutrition_tip?: string): WorkoutPlanRecord {
  const db = ensureDbFile();
  const existing = db.plans.find((p) => p.user_id === user_id);

  if (existing) {
    existing.original_plan = original_plan;
    if (nutrition_tip) existing.nutrition_tip = nutrition_tip;
    existing.updatedAt = new Date().toISOString();
    writeDbFile(db);
    return existing;
  } else {
    const newPlan: WorkoutPlanRecord = {
      id: db.plans.length + 1,
      user_id,
      original_plan,
      updated_plan: null,
      nutrition_tip: nutrition_tip || null,
      updatedAt: new Date().toISOString(),
    };
    db.plans.push(newPlan);
    writeDbFile(db);
    return newPlan;
  }
}

export function updatePlan(user_id: number, updated_text: string, new_tip?: string): WorkoutPlanRecord | null {
  const db = ensureDbFile();
  const plan = db.plans.find((p) => p.user_id === user_id);
  if (!plan) return null;

  plan.updated_plan = updated_text;
  if (new_tip) plan.nutrition_tip = new_tip;
  plan.updatedAt = new Date().toISOString();
  writeDbFile(db);
  return plan;
}

export function getOriginalPlan(user_id: number): string | null {
  const db = ensureDbFile();
  const plan = db.plans.find((p) => p.user_id === user_id);
  return plan ? plan.original_plan : null;
}

export function getUser(user_id: number): UserRecord | null {
  const db = ensureDbFile();
  const user = db.users.find((u) => u.id === user_id);
  return user || null;
}

export function getWorkoutPlan(user_id: number): WorkoutPlanRecord | null {
  const db = ensureDbFile();
  const plan = db.plans.find((p) => p.user_id === user_id);
  return plan || null;
}

export function getAllUsersWithPlans() {
  const db = ensureDbFile();
  return db.users.map((user) => {
    const plan = db.plans.find((p) => p.user_id === user.id);
    return {
      id: user.id,
      name: user.name,
      age: user.age,
      weight: user.weight,
      goal: user.goal,
      intensity: user.intensity,
      schedule: user.schedule,
      original_plan: plan?.original_plan || "N/A",
      updated_plan: plan?.updated_plan || "Not updated",
      nutrition_tip: plan?.nutrition_tip || null,
    };
  });
}
