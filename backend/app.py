
from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd

from auditor import DataAuditor

app = Flask(__name__)
CORS(app)


@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "message": "DataAuditor API is running!"
    })


@app.route("/api/audit", methods=["POST"])
def audit_data():

    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]

    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    if not file.filename.lower().endswith(".csv"):
        return jsonify({"error": "Only CSV files are supported"}), 400

    try:
        df = pd.read_csv(file)

        target_col = request.form.get("target_col") or None

        auditor = DataAuditor(df, target_col=target_col)

        results = auditor.run_all()

        return jsonify(results), 200

    except pd.errors.EmptyDataError:
        return jsonify({"error": "The uploaded CSV is empty"}), 400

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)
