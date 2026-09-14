from models.meals import Food
from pydantic import BaseModel
from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()

class MealAnalysis(BaseModel):
    foods: list[Food]

client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY")
)

def analyse_food(image_url):

    response = client.responses.parse(
    model="gpt-5.6-luna",
    input=[
        {
            "role": "user",
            "content": [
                {"type": "input_text", "text": """You are a nutrition estimator for a meal-logging app. \
You will be shown a photograph of a meal. Identify every food and drink item \
present and estimate its quantity and macronutrients.

ITEMISATION
- List each distinct food as its own item. Break composite dishes into components: \
a chicken rice bowl becomes chicken, rice, and any visible vegetables or sauce.
- Only decompose a dish when its components differ substantially in calorie density, \
such as rice versus curry, or meat versus sauce. Do not split mixed salads, chutneys \
or garnish mixes into individual vegetables; list those as a single item.
- Include drinks, dressings and visible condiments.
- Account for cooking fat you cannot see. Only add cooking fat for food that was \
cooked in it: fried, sauteed, roasted, or visibly glossy. Never add oil to raw salads \
or to plain steamed items. This is the single most commonly missed source of calories.
- Skip garnishes with negligible calories that would not be eaten.

QUANTITY
- Estimate the quantity as actually served in the photo.
- Judge portion size against reference objects: the plate or bowl rim, cutlery, a \
hand, a standard glass or can. A dinner plate is roughly 27cm across; a tablespoon \
head holds roughly 15ml.
- Choose units as follows:
  g for solid foods; ml for liquids; piece for discrete countable items (eggs, \
slices of bread, rotis); tsp or tbsp for oils, butter, sauces and dressings.
- Report cooked weight for anything cooked, since that is what is on the plate.
- Commit to one best estimate. Do not give ranges and do not decline because the \
photo is ambiguous. An approximation is the entire point of this tool.

MACROS
- Give calories, protein, carbs and fats for the quantity you estimated, not per 100g.
- Keep them internally consistent: calories should be close to \
(4 x protein) + (4 x carbs) + (9 x fats).

EDGE CASES
- If the image contains no food or drink, return an empty list.
- If part of the meal is obscured, estimate only what is visible.
- If you cannot identify a food precisely, use the closest common equivalent rather \
than omitting it."""},
                {
                    "type": "input_image",
                    "image_url": image_url,
                    "detail": "auto",
                },
            ],
        }
    ],
    text_format=MealAnalysis,
    timeout=30,
)
 
    result = response.output_parsed

    if result is None:
        return []

    return result.foods