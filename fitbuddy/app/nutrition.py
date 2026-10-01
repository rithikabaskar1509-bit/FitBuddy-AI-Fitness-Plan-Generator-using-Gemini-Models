def get_nutrition_guidelines(goal: str) -> dict:
    goal_lower = (goal or "general fitness").lower()
    if "weight" in goal_lower or "fat" in goal_lower or "loss" in goal_lower:
        return {
            "calories_focus": "Caloric deficit of 300-500 kcal below maintenance",
            "protein_ratio": "30-35% (1.8-2.2g per kg body weight)",
            "carbs_ratio": "35-40% (Complex carbs, high fiber)",
            "fats_ratio": "25-30% (Healthy unsaturated fats)",
            "hydration": "3 to 4 liters of water daily"
        }
    elif "muscle" in goal_lower or "gain" in goal_lower:
        return {
            "calories_focus": "Caloric surplus of 250-400 kcal above maintenance",
            "protein_ratio": "25-30% (1.6-2.0g per kg body weight)",
            "carbs_ratio": "45-55% (Sustained energy and glycogen replenishment)",
            "fats_ratio": "20-25% (Hormone health and joint support)",
            "hydration": "3.5 to 4.5 liters of water daily"
        }
    else:
        return {
            "calories_focus": "Maintenance calorie level for sustained energy",
            "protein_ratio": "20-25% (1.2-1.6g per kg body weight)",
            "carbs_ratio": "45-50% (Whole grains, fruits, vegetables)",
            "fats_ratio": "25-30% (Nuts, seeds, olive oil)",
            "hydration": "2.5 to 3.5 liters of water daily"
        }
