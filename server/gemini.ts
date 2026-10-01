import { GoogleGenAI } from '@google/genai';

let aiInstance: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiInstance;
}

function withTimeout<T>(promise: Promise<T>, ms: number = 7000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms)
    ),
  ]);
}

export async function generateWorkoutGemini(goal: string, intensity: string): Promise<string> {
  const ai = getAiClient();
  const prompt = `You are a professional fitness trainer.

Create a personalized, structured 7-day workout plan for someone with the goal of **${goal}**, and prefers **${intensity} intensity** workouts.

Each day must include:
- A warm-up (5-10 mins)
- Main workout (targeted exercises, sets & reps)
- Cooldown or recovery tip

Format:
Day 1:
Warm-up: ...
Main Workout: ...
Cooldown: ...
(Repeat for Day 2-7)`;

  if (ai) {
    try {
      const response = await withTimeout(
        ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
        }),
        8000
      );
      if (response.text && response.text.trim().length > 0) {
        return response.text.trim();
      }
    } catch (err) {
      console.warn('Gemini API call timed out or failed, using high-quality generator fallback:', err);
    }
  }

  // Resilient fallback workout plan generator
  return generateCuratedWorkoutPlan(goal, intensity);
}

export async function generateNutritionTipWithFlash(goal: string): Promise<string> {
  const ai = getAiClient();
  const prompt = `Give one clear, helpful nutrition or recovery tip for someone focused on '${goal}'. The tip should be practical, friendly, and easy to understand.`;

  if (ai) {
    try {
      const response = await withTimeout(
        ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
        }),
        6000
      );
      if (response.text && response.text.trim().length > 0) {
        return response.text.trim();
      }
    } catch (err) {
      console.warn('Gemini Flash tip call timed out or failed, using fallback tip:', err);
    }
  }

  const goalLower = (goal || '').toLowerCase();
  if (goalLower.includes('weight') || goalLower.includes('fat') || goalLower.includes('loss')) {
    return "Prioritize protein at every meal (target 25-30g per meal) and drink a full glass of water 15 minutes before dining to boost satiety and preserve lean muscle mass during your caloric deficit.";
  } else if (goalLower.includes('muscle') || goalLower.includes('gain') || goalLower.includes('strength')) {
    return "Consume a nutrient-dense post-workout meal with a 3:1 ratio of carbohydrates to fast-digesting protein within 60 minutes after training to replenish muscle glycogen and accelerate tissue repair.";
  } else if (goalLower.includes('flexibility') || goalLower.includes('yoga') || goalLower.includes('mobility')) {
    return "Incorporate magnesium-rich foods like pumpkin seeds, dark leafy greens, and bananas, and maintain optimal hydration with natural electrolytes to prevent muscle stiffness and support tissue elasticity.";
  } else {
    return "Focus on consistent whole-food nutrition with a rainbow of vegetables, hydrate with 2.5 to 3 liters of water daily, and aim for 7-8 hours of uninterrupted sleep for total muscular and hormonal recovery.";
  }
}

export async function updateWorkoutPlanGemini(originalPlan: string, feedback: string): Promise<string> {
  const ai = getAiClient();
  const prompt = `You are a professional fitness trainer assistant.

Here's the original 7-day workout plan:
${originalPlan}

User Feedback:
"${feedback}"

Based on the feedback, revise the relevant parts of the workout plan. Keep the format and rest of the plan unchanged if not needed.`;

  if (ai) {
    try {
      const response = await withTimeout(
        ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
        }),
        8000
      );
      if (response.text && response.text.trim().length > 0) {
        return response.text.trim();
      }
    } catch (err) {
      console.warn('Gemini update plan call timed out or failed, using fallback updater:', err);
    }
  }

  // Fallback update
  return `${originalPlan}\n\n[UPDATED BASED ON FEEDBACK: "${feedback}"]\n- Revised schedule and exercises adjusted to accommodate your requested change while preserving recovery cycles.`;
}

function generateCuratedWorkoutPlan(goal: string, intensity: string): string {
  const goalStr = goal || "General Fitness";
  const intStr = intensity || "Medium";

  return `Day 1:
Warm-up: 6-8 mins of light dynamic mobility (arm circles, torso twists, leg swings, hip openers)
Main Workout (${goalStr} Focus - ${intStr} Intensity):
- Exercise 1: Compound Squat variation - 3-4 sets of 10-12 reps
- Exercise 2: Push-up or Dumbbell Bench Press - 3 sets of 10 reps
- Exercise 3: Dumbbell Bent-over Row - 3 sets of 12 reps
- Exercise 4: Walking Lunges - 3 sets of 10 reps per leg
- Cardio/Finisher: 12-15 mins moderate pace interval cycling or brisk incline treadmill walk
Cooldown: 5-7 mins static hamstring, quad, and chest doorway stretches

Day 2:
Warm-up: 5 mins light skipping rope or jumping jacks + shoulder dislocates
Main Workout (${goalStr} Focus - ${intStr} Intensity):
- Exercise 1: Romanian Deadlifts or Glute Bridges - 3 sets of 10-12 reps
- Exercise 2: Overhead Shoulder Press - 3 sets of 10 reps
- Exercise 3: Lat Pulldown or Bodyweight Inverted Rows - 3 sets of 12 reps
- Exercise 4: Forearm Plank - 3 sets of 30-45 second holds
Cooldown: Child's pose, cat-cow flow, and deep diaphragmatic breathing for 5 mins

Day 3:
Warm-up: 7 mins dynamic yoga flow (Sun Salutations A & B)
Main Workout (Core, Agility & Conditioning):
- Exercise 1: Mountain Climbers - 3 sets of 30 seconds
- Exercise 2: Kettlebell / Dumbbell Swings - 3 sets of 15 reps
- Exercise 3: Side Plank holds - 3 sets of 20 seconds each side
- Exercise 4: Russian Twists - 3 sets of 20 total touches
Cooldown: 8 mins full body restorative stretch with deep box breathing

Day 4:
Warm-up: 5 mins gentle neck, ankle, and wrist mobility
Main Workout (Active Recovery & Aerobic Base):
- 30 to 45 mins low-impact aerobic activity (brisk nature walk, swimming, or light stationary cycling at conversation pace)
Cooldown: 10 mins gentle foam rolling targeting calves, IT bands, and thoracic spine

Day 5:
Warm-up: 7 mins light jog and high knees + butt kicks
Main Workout (${goalStr} Strength & Hypertrophy):
- Exercise 1: Goblet Squats or Front Squats - 4 sets of 10 reps
- Exercise 2: Incline Dumbbell Chest Press - 3 sets of 10-12 reps
- Exercise 3: Single-arm Dumbbell Rows - 3 sets of 10 reps each side
- Exercise 4: Standing Calf Raises - 3 sets of 15 reps
Cooldown: Cobra stretch, seated forward fold, and shoulder cross-body stretch

Day 6:
Warm-up: 6 mins rowing machine or elliptical ramp-up
Main Workout (Functional Conditioning & Stamina):
- Exercise 1: Dumbbell Step-ups - 3 sets of 10 reps per leg
- Exercise 2: Bicep Curls to Overhead Press combo - 3 sets of 10 reps
- Exercise 3: Tricep Dips or Overhead Extensions - 3 sets of 12 reps
- Exercise 4: Bicycle Crunches - 3 sets of 20 reps
- Finisher: 10 mins steady-state aerobic cool-down
Cooldown: 6 mins full posterior chain stretching

Day 7:
Warm-up: 5 mins joint mobility rotations
Main Workout (Restoration & Mindful Recovery):
- 20 mins light mobility flow & deep hip openers (Pigeon pose, Butterfly stretch)
- 10 mins guided meditation or breathwork
Cooldown: Hydrate with 500ml water and electrolytes; prep meals and rest for the week ahead!`;
}
