from pydantic import BaseModel, Field
from typing import Optional

class WorkoutRequest(BaseModel):
    goal: str = Field(..., description="Fitness goal, e.g. weight loss, muscle gain")
    intensity: str = Field(..., description="Workout intensity: low, medium, high")

class UserInput(BaseModel):
    user_id: int = Field(..., description="Unique ID for the user")
    username: str = Field(..., description="Full name of the user")
    age: int = Field(..., gt=0, lt=130, description="Age of the user")
    weight: float = Field(..., gt=0, description="Weight of the user in kg")
    goal: str = Field(..., description="Fitness goal, e.g., muscle gain, weight loss")
    intensity: str = Field(..., description="Workout intensity: low, medium, high")

class FeedbackRequest(BaseModel):
    feedback: str = Field(..., description="Feedback or requested modifications")

class UserResponse(BaseModel):
    id: int
    name: str
    age: int
    weight: float
    goal: str
    intensity: str
    schedule: int

    class Config:
        from_attributes = True

class WorkoutPlanResponse(BaseModel):
    id: int
    user_id: int
    original_plan: Optional[str] = None
    updated_plan: Optional[str] = None

    class Config:
        from_attributes = True
