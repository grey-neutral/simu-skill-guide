cd backend 
python -m venv venv
pip install -r requirements.txt
source venv/bin/activate
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload  