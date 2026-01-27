import os
from typing import Iterable, Optional
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

def stream_visualization_analysis(
    *,
    base64_image: str,
    title: str,
    chart_type: Optional[str] = None,
) -> Iterable[str]:
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise RuntimeError("GOOGLE_API_KEY is not set")

    chart_label = chart_type or "chart"

    client = OpenAI(
        api_key=api_key,
        base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
    )

    system_prompt = (
        "You are a data analyst specializing in food security and agricultural "
        "economics for Somalia. Provide concise, data-driven insights."
    )
    user_prompt = (
        f"Analyze this {chart_label} visualization titled \"{title}\".\n\n"
        "Provide:\n"
        "1. A brief description of what the chart shows\n"
        "2. Key patterns or trends you observe\n"
        "3. Notable outliers or anomalies\n"
        "4. 2-3 actionable insights or conclusions\n\n"
        "Keep your analysis concise and use bullet points where appropriate."
    )

    response = client.chat.completions.create(
        model="gemini-2.5-flash",
        messages=[
            {"role": "system", "content": system_prompt},
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": user_prompt},
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/png;base64,{base64_image}"
                        },
                    },
                ],
            },
        ],
        stream=True,
    )

    for chunk in response:
        delta = chunk.choices[0].delta
        if delta and delta.content:
            yield delta.content
