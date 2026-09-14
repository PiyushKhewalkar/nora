from models.user import Sex, ActivityLevel, Goal
from models.meals import Food


ACTIVITY_MULTIPLIERS = {
    ActivityLevel.SEDENTARY: 1.2,
    ActivityLevel.LIGHTLY_ACTIVE: 1.375,
    ActivityLevel.MODERATELY_ACTIVE: 1.55,
    ActivityLevel.VERY_ACTIVE: 1.725,
    ActivityLevel.EXTRA_ACTIVE: 1.9,
}


def calculate_targets(
    age: int,
    sex: Sex,
    height: float,
    weight: float,
    activity_level: ActivityLevel,
    goal: Goal,
) -> dict:

    # Calculate BMR using Mifflin-St Jeor equation
    if sex == Sex.MALE:
        bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5
    elif sex == Sex.FEMALE:
        bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161
    else:
        # We need a fallback for "prefer not to say"
        bmr = (10 * weight) + (6.25 * height) - (5 * age)

    # Calculate TDEE
    activity_multiplier = ACTIVITY_MULTIPLIERS[activity_level]
    tdee = bmr * activity_multiplier

    # Adjust calories based on goal
    if goal == Goal.LOSE_WEIGHT:
        calories = tdee - 500
    elif goal == Goal.GAIN_WEIGHT:
        calories = tdee + 300
    else:
        calories = tdee

    # Protein target
    protein = weight * 1.6

    # Fat target: ~25% of calories
    fat = (calories * 0.25) / 9

    # Remaining calories come from carbohydrates
    carbs = (calories - (protein * 4) - (fat * 9)) / 4

    return {
        "daily_calorie_target": round(calories),
        "daily_protein_target": round(protein),
        "daily_carbs_target": round(carbs),
        "daily_fat_target": round(fat),
    }


def calculate_totals(foods: list[Food]) -> dict:
    """Sum a food list into meal totals. The only source of truth for a meal's numbers."""
    return {
        "total_calories": round(sum(f.calories for f in foods), 1),
        "total_protein": round(sum(f.protein for f in foods), 1),
        "total_carbs": round(sum(f.carbs for f in foods), 1),
        "total_fats": round(sum(f.fats for f in foods), 1),
    }
