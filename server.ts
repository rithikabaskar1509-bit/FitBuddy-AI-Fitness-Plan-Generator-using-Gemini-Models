import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import {
  saveUser,
  savePlan,
  updatePlan,
  getOriginalPlan,
  getUser,
  getWorkoutPlan,
  getAllUsersWithPlans,
} from './server/db.js';
import {
  generateWorkoutGemini,
  generateNutritionTipWithFlash,
  updateWorkoutPlanGemini,
} from './server/gemini.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

async function startServer() {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use('/static', express.static(path.resolve(__dirname, 'public/static')));

  // API 1: Generate Workout with Gemini
  app.post('/api/generate-workout/gemini', async (req: Request, res: Response) => {
    try {
      const { goal, intensity } = req.body;
      if (!goal || !intensity) {
        return res.status(400).json({ error: 'goal and intensity are required' });
      }
      const plan = await generateWorkoutGemini(goal, intensity);
      return res.json({ model: 'gemini-3.8-flash', workout_plan: plan });
    } catch (err: any) {
      console.error('Error generating workout:', err);
      return res.status(500).json({ error: err.message || 'Failed to generate workout' });
    }
  });

  // API 2: Generate Nutrition Tip with Gemini Flash
  app.get('/api/nutrition-tip', async (req: Request, res: Response) => {
    try {
      const goal = (req.query.goal as string) || 'general fitness';
      const tip = await generateNutritionTipWithFlash(goal);
      return res.json({ goal, nutrition_tip: tip });
    } catch (err: any) {
      console.error('Error generating nutrition tip:', err);
      return res.status(500).json({ error: err.message || 'Failed to generate nutrition tip' });
    }
  });

  // API 3: Save user info & generate plan (combined workflow)
  app.post('/api/generate-plan', async (req: Request, res: Response) => {
    try {
      const { user_id, username, age, weight, goal, intensity } = req.body;
      const parsedUserId = parseInt(String(user_id), 10);
      const parsedAge = parseInt(String(age), 10) || 25;
      const parsedWeight = parseFloat(String(weight)) || 70.0;

      if (isNaN(parsedUserId) || !username || !goal || !intensity) {
        return res.status(400).json({ error: 'Missing required user parameters' });
      }

      // Save user in DB
      saveUser(parsedUserId, username, parsedAge, parsedWeight, goal, intensity);

      // Generate workout & tip
      const workoutPlan = await generateWorkoutGemini(goal, intensity);
      const nutritionTip = await generateNutritionTipWithFlash(goal);

      // Save plan in DB
      savePlan(parsedUserId, workoutPlan, nutritionTip);

      return res.json({
        message: 'Workout plan generated and saved successfully!',
        user_id: parsedUserId,
        username,
        age: parsedAge,
        weight: parsedWeight,
        goal,
        intensity,
        workout_plan: workoutPlan,
        nutrition_tip: nutritionTip,
      });
    } catch (err: any) {
      console.error('Error in /api/generate-plan:', err);
      return res.status(500).json({ error: err.message || 'Internal server error' });
    }
  });

  // API 4: Update plan with feedback
  app.post('/api/update-plan/:user_id', async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.user_id, 10);
      const { feedback } = req.body;

      if (isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user_id' });
      }
      if (!feedback) {
        return res.status(400).json({ error: 'feedback is required' });
      }

      const original = getOriginalPlan(userId);
      if (!original) {
        return res.status(404).json({ error: 'Original plan not found for this user.' });
      }

      const updated = await updateWorkoutPlanGemini(original, feedback);
      const user = getUser(userId);
      const freshTip = await generateNutritionTipWithFlash(user?.goal || 'general fitness');

      updatePlan(userId, updated, freshTip);

      return res.json({
        status: 'success',
        user_id: userId,
        original_plan: original,
        updated_plan: updated,
        nutrition_tip: freshTip,
        success_message: 'Your plan has been updated based on your feedback!',
      });
    } catch (err: any) {
      console.error('Error in /api/update-plan:', err);
      return res.status(500).json({ error: err.message || 'Internal server error' });
    }
  });

  // API 5: Get all users & plans
  app.get('/api/users', (req: Request, res: Response) => {
    const users = getAllUsersWithPlans();
    return res.json(users);
  });

  // API 6: Get specific user
  app.get('/api/user/:user_id', (req: Request, res: Response) => {
    const userId = parseInt(req.params.user_id, 10);
    if (isNaN(userId)) return res.status(400).json({ error: 'Invalid user_id' });

    const user = getUser(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const plan = getWorkoutPlan(userId);
    return res.json({ user, plan });
  });

  // Fallback direct web form POSTs (redirecting to SPA with query parameters for seamless UX)
  app.post('/generate', async (req: Request, res: Response) => {
    const { username, user_id, age, weight, goal, intensity } = req.body;
    const parsedUserId = parseInt(String(user_id), 10);
    if (!isNaN(parsedUserId)) {
      saveUser(
        parsedUserId,
        username || 'User',
        parseInt(String(age), 10) || 25,
        parseFloat(String(weight)) || 70,
        goal || 'General Fitness',
        intensity || 'Medium'
      );
      const plan = await generateWorkoutGemini(goal, intensity);
      const tip = await generateNutritionTipWithFlash(goal);
      savePlan(parsedUserId, plan, tip);
      return res.redirect(`/?view=result&userId=${parsedUserId}`);
    }
    return res.redirect('/');
  });

  app.post('/update-feedback', async (req: Request, res: Response) => {
    const { user_id, feedback } = req.body;
    const parsedUserId = parseInt(String(user_id), 10);
    if (!isNaN(parsedUserId) && feedback) {
      const original = getOriginalPlan(parsedUserId);
      if (original) {
        const updated = await updateWorkoutPlanGemini(original, feedback);
        const user = getUser(parsedUserId);
        const tip = await generateNutritionTipWithFlash(user?.goal || 'general fitness');
        updatePlan(parsedUserId, updated, tip);
        return res.redirect(`/?view=result&userId=${parsedUserId}&updated=true`);
      }
    }
    return res.redirect(`/?view=result&userId=${user_id}`);
  });

  app.get('/view-all-users', (req: Request, res: Response) => {
    return res.redirect('/?view=users');
  });

  // Mount Vite or static files
  if (!isProduction) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FitBuddy server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server start error:', err);
  process.exit(1);
});
