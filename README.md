# DataAuditor

A full-stack data auditing application that helps users identify missing values, detect outliers, and flag potential data leakage in CSV datasets.

## Features
- Upload CSV datasets
- Detect missing values
- Identify numerical outliers using the IQR method
- Flag potential data leakage
- Display dataset summaries
- Visualize missing values and outliers using Chart.js

## Tech Stack
- Python
- Flask
- Pandas
- JavaScript
- HTML and CSS
- Chart.js
- REST API and JSON

## Run Locally

1. Clone the repository:
   git clone https://github.com/asthasharma1122/Data_Auditor.git

2. Navigate into the project:
   cd Data_Auditor

3. Create and activate a virtual environment:
   python -m venv .venv
   .venv\Scripts\activate

4. Install dependencies:
   pip install -r requirements.txt

5. Start the backend:
   python -m backend.app

6. Open frontend/index.html in your browser.

## Project Structure

- auditor.py - Core data auditing logic
- backend/ - Flask API
- frontend/ - User interface and visualizations
- sample_data/ - Sample CSV datasets
- test.py - Basic testing
