from fastapi import APIRouter, UploadFile, File, HTTPException
from ...core.models import CVExtractionResponse
from ...services.pdf_service import pdf_service

router = APIRouter()

@router.post("/cv/extract", response_model=CVExtractionResponse)
async def extract_cv_text(file: UploadFile = File(...)):
    """Extract text from uploaded CV (PDF or TXT)"""
    try:
        # Validate file size (10MB max)
        if file.size and file.size > 10 * 1024 * 1024:
            raise HTTPException(status_code=413, detail="File too large. Maximum size is 10MB.")
        
        # Read file content
        file_content = await file.read()
        
        # Extract text
        extracted_text = pdf_service.extract_text(file_content, file.filename or "unknown.txt")
        
        return CVExtractionResponse(
            success=True,
            extracted_text=extracted_text
        )
    
    except ValueError as e:
        return CVExtractionResponse(
            success=False,
            error_message=str(e)
        )
    except Exception as e:
        return CVExtractionResponse(
            success=False,
            error_message=f"Unexpected error: {str(e)}"
        )