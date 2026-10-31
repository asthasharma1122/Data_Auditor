
import pandas as pd


class DataAuditor:

    def __init__(self, df, target_col=None):
        self.df = df
        self.target_col = target_col

    def check_missingness(self):

        missing_counts = self.df.isnull().sum()
        total_rows = len(self.df)

        results = {}

        if total_rows == 0:
            return results

        for column, count in missing_counts.items():

            if count > 0:
                percentage = (count / total_rows) * 100

                results[column] = {
                    "count": int(count),
                    "percentage": round(percentage, 2)
                }

        return results

    def check_outliers(self):

        numeric_cols = self.df.select_dtypes(
            include="number"
        ).columns

        total_rows = len(self.df)
        results = {}

        if total_rows == 0:
            return results

        for column in numeric_cols:

            q1 = self.df[column].quantile(0.25)
            q3 = self.df[column].quantile(0.75)

            iqr = q3 - q1

            lower_bound = q1 - 1.5 * iqr
            upper_bound = q3 + 1.5 * iqr

            outliers = self.df[
                (self.df[column] < lower_bound) |
                (self.df[column] > upper_bound)
            ]

            count = len(outliers)

            if count > 0:

                results[column] = {
                    "count": int(count),
                    "percentage": round(
                        (count / total_rows) * 100, 2
                    ),
                    "lower_bound": float(lower_bound),
                    "upper_bound": float(upper_bound)
                }

        return results

    def check_leakage(self):

        results = []

        if self.target_col is None:
            return results

        if self.target_col not in self.df.columns:
            return results

        target = self.df[self.target_col]

        for column in self.df.columns:

            if column == self.target_col:
                continue

            col = self.df[column]

            if col.equals(target):

                results.append({
                    "column": column,
                    "issue": "Identical to target"
                })
                continue

            if (
                pd.api.types.is_numeric_dtype(col)
                and pd.api.types.is_numeric_dtype(target)
            ):

                corr = col.corr(target)

                if pd.notna(corr) and abs(corr) > 0.95:

                    results.append({
                        "column": column,
                        "issue": "High correlation with target",
                        "correlation": round(float(corr), 3)
                    })

            n_unique = col.nunique(dropna=True)

            if n_unique > 0.95 * len(self.df):

                results.append({
                    "column": column,
                    "issue": "Possible identifier/leakage",
                    "unique_values": int(n_unique)
                })

        return results

    def run_all(self):

        return {
            "summary": {
                "total_rows": len(self.df),
                "total_columns": len(self.df.columns)
            },
            "missing_values": self.check_missingness(),
            "outliers": self.check_outliers(),
            "leakage": self.check_leakage()
        }
