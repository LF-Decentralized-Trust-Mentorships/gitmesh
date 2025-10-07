from flask.cli import load_dotenv
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import google.generativeai as genai
import os

router = APIRouter(prefix="/gemini", tags=["Gemini"])


# Configure Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-2.5-flash')
else:
    model = None

class PRSummaryRequest(BaseModel):
    title: str
    body: str
    diff: str

@router.post("/summarize-pr")
async def summarize_pr(request: PRSummaryRequest):
    if not model:
        return {
            "success": False,
            "summary": "Gemini API key not configured."
        }
    
    try:
        # Truncate diff to avoid token limits
        diff_preview = request.diff[:2000] if request.diff else "No code changes available"
        
        prompt = f"""You are analyzing a GitHub Pull Request. Provide a brief, clear summary in 2-3 sentences.

PR Title: {request.title}

PR Description:
{request.body}

Code Changes (diff preview):
{diff_preview}

Summarize:
1. What this PR does
2. Main changes made
3. Any notable impacts

Keep it concise and developer-friendly."""
        
        # Generate content with Gemini
        response = model.generate_content(prompt)
        
        # Extract text from response
        if hasattr(response, 'text'):
            summary = response.text
        elif hasattr(response, 'candidates') and len(response.candidates) > 0:
            # Handle response structure
            candidate = response.candidates[0]
            if hasattr(candidate, 'content'):
                summary = candidate.content.parts[0].text
            else:
                summary = str(candidate)
        else:
            summary = "Unable to generate summary"
        
        return {
            "success": True,
            "summary": summary
        }
        
    except Exception as e:
        error_msg = str(e)
        print(f"Error generating summary: {error_msg}")
        
        # Return more helpful error messages
        if "API_KEY" in error_msg.upper():
            error_detail = "Invalid or missing Gemini API key"
        elif "QUOTA" in error_msg.upper():
            error_detail = "Gemini API quota exceeded"
        elif "RATE_LIMIT" in error_msg.upper():
            error_detail = "Rate limit exceeded, please try again later"
        else:
            error_detail = "Unable to generate AI summary at this time"
        
        return {
            "success": False,
            "summary": error_detail
        }