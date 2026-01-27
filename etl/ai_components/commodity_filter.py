import os
import json
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def filter_commodities(commodity_list, max_retries=3):
    """
    Uses AI to filter a list of commodities and keep only those related to agrifood.
    (e.g., keeps Rice, Maize, Wheat; removes Livestock, Fuel, etc.)
    """
    print("Filtering commodities using AI...")
    
    client = OpenAI(
        api_key=os.getenv("GOOGLE_API_KEY"),
        base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
    )

    prompt = f"""
    I have a list of commodities from a dataset. I want to keep only those that are direct food items or primary agricultural food products.
    Exclude non-food items (like fuel, charcoal, water), services, or live animals (livestock) unless they are specifically meat products.
    
    List of commodities:
    {commodity_list}

    Return only a JSON object with a single key "agrifood_commodities" whose value is a list of the filtered commodity names.
    """

    for attempt in range(max_retries):
        try:
            response = client.chat.completions.create(
                model="gemini-2.5-flash",
                messages=[
                    {"role": "system", "content": "You are a data engineering assistant specializing in agrifood data classification."},
                    {"role": "user", "content": prompt}
                ],
                response_format={ "type": "json_object" }
            )

            content = response.choices[0].message.content
            if content is None:
                raise ValueError("Model returned empty content")
                
            result = json.loads(content)
            filtered_list = result.get("agrifood_commodities", [])
            print(f"Commodity filtering completed ✅ (Kept {len(filtered_list)}/{len(commodity_list)})")
            return filtered_list
            
        except Exception as e:
            if attempt < max_retries - 1:
                print(f"oops 🤭 the AI is having trouble sorting the food. Let's try again! (Attempt {attempt + 1}/{max_retries})")
            else:
                print(f"Oh no! 😱 The AI failed to filter commodities. Proceeding with all commodities to avoid script failure... : \n {e}")
                return commodity_list
