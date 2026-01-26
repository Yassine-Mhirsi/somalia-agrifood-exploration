import os
import json
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def get_region_mapping(admin1_prices, admin1_crop, max_retries=3):
    """
    Uses AI to match region names between two lists with different naming conventions.
    """
    print("Initializing AI-based region mapping...")
    
    client = OpenAI(
        api_key=os.getenv("GOOGLE_API_KEY"),
        base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
    )

    prompt = f"""
    I have two datasets with region names for Somalia that use different naming conventions (e.g., Somali vs English).
    Match the names from List A to the most equivalent names in List B.

    List A (from prices dataset):
    {admin1_prices}

    List B (from crop production dataset):
    {admin1_crop}

    Return only a JSON object where keys are names from List A and values are the matching names from List B. 
    If a name has no match, use null as the value.
    """

    mapping = None
    
    for attempt in range(max_retries):
        try:
            response = client.chat.completions.create(
                model="gemini-3-flash-preview",
                messages=[
                    {"role": "system", "content": "You are a data engineering assistant specializing in geographic data mapping."},
                    {"role": "user", "content": prompt}
                ],
                response_format={ "type": "json_object" }
            )

            content = response.choices[0].message.content
            if content is None:
                raise ValueError("Model returned empty content")
                
            mapping = json.loads(content)
            print("AI-based region mapping completed ✅")
            return mapping
            
        except Exception as e:
            if attempt < max_retries - 1:
                print(f"oops 🤭 looks like the model got a bit confused: {e}. Let's try again! (Attempt {attempt + 1}/{max_retries})")
            else:
                print("Oh no! 😱 The AI failed us after 3 tries. I think something is wrong on your end 🫵 Please check your API key is valid or/and and try again.")
                raise e
