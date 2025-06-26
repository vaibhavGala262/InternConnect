from google import genai
import os
from dotenv import load_dotenv

def get_gemini_response(prompt: str) -> str:
    # Load environment variables
    load_dotenv()

    # Initialize the Gemini client
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY not found in environment variables.")
    
    client = genai.Client(api_key=api_key)

    # Generate response from Gemini
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=prompt
    )

    return response.text

# Example usage
# if __name__ == "__main__":
#     prompt = "Explain how AI works in a few words"
#     print(get_gemini_response(prompt))
