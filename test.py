
import pandas as pd
import json

from auditor import DataAuditor

# Creating sample dataset
df = pd.DataFrame({
    "age": [25, 30, 35, None, 400],
    "salary": [50000, 60000, None, 80000, 100000]
})

# Creating DataAuditor object
auditor = DataAuditor(df, target_col=None)

# Running all checks
results = auditor.run_all()

# Displaying results in JSON format
print(json.dumps(results, indent=4))
