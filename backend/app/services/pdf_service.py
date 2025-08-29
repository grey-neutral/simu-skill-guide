import PyPDF2
import io
from typing import Optional
import re


class PDFService:
    def __init__(self):
        pass
    
    def extract_text_from_pdf(self, file_bytes: bytes) -> str:
        """Extract text from PDF bytes"""
        try:
            # Create PDF reader from bytes
            pdf_file = io.BytesIO(file_bytes)
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            
            extracted_text = ""
            
            # Extract text from all pages
            for page_num in range(len(pdf_reader.pages)):
                page = pdf_reader.pages[page_num]
                text = page.extract_text()
                extracted_text += text + "\n"
            
            # Clean and format the extracted text
            cleaned_text = self._clean_text(extracted_text)
            
            return cleaned_text
        
        except Exception as e:
            print(f"PDF extraction error: {e}")
            raise ValueError(f"Failed to extract text from PDF: {str(e)}")
    
    def extract_text_from_text_file(self, file_bytes: bytes) -> str:
        """Extract text from plain text file"""
        try:
            # Try different encodings
            encodings = ['utf-8', 'latin-1', 'cp1252']
            
            for encoding in encodings:
                try:
                    text = file_bytes.decode(encoding)
                    return self._clean_text(text)
                except UnicodeDecodeError:
                    continue
            
            raise ValueError("Could not decode text file with any standard encoding")
        
        except Exception as e:
            print(f"Text file extraction error: {e}")
            raise ValueError(f"Failed to extract text from file: {str(e)}")
    
    def _clean_text(self, text: str) -> str:
        """Clean and format extracted text"""
        if not text:
            return ""
        
        # Remove excessive whitespace
        text = re.sub(r'\n\s*\n', '\n\n', text)  # Multiple newlines to double newline
        text = re.sub(r' +', ' ', text)  # Multiple spaces to single space
        
        # Remove special characters and formatting artifacts
        text = re.sub(r'[^\w\s\-\.\,\(\)\@\+\n]', ' ', text)
        
        # Trim whitespace
        text = text.strip()
        
        return text
    
    def validate_file_type(self, filename: str, file_bytes: bytes) -> str:
        """Validate file type and return the type"""
        filename_lower = filename.lower()
        
        # Check by file extension
        if filename_lower.endswith('.pdf'):
            # Verify it's actually a PDF by checking magic bytes
            if file_bytes.startswith(b'%PDF'):
                return 'pdf'
            else:
                raise ValueError("File appears to be corrupted or not a valid PDF")
        
        elif filename_lower.endswith(('.txt', '.text')):
            return 'text'
        
        else:
            # Try to detect based on content
            if file_bytes.startswith(b'%PDF'):
                return 'pdf'
            else:
                # Assume it's text if we can't determine
                return 'text'
    
    def extract_text(self, file_bytes: bytes, filename: str) -> str:
        """Main method to extract text from any supported file type"""
        file_type = self.validate_file_type(filename, file_bytes)
        
        if file_type == 'pdf':
            return self.extract_text_from_pdf(file_bytes)
        elif file_type == 'text':
            return self.extract_text_from_text_file(file_bytes)
        else:
            raise ValueError(f"Unsupported file type: {file_type}")


# Global service instance
pdf_service = PDFService()