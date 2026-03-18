import sys
import json
import os
from sklearn.ensemble import RandomForestClassifier

def main():
    if len(sys.argv) < 3:
        print("Usage: python rf_trainer.py <features_json_path> <labels_json_path> <output_model_path>")
        sys.exit(1)

    features_file = sys.argv[1]
    labels_file = sys.argv[2]
    output_model = sys.argv[3]

    try:
        with open(features_file, 'r') as f:
            X = json.load(f)
        with open(labels_file, 'r') as f:
            y = json.load(f)

        print(f"Loaded {len(X)} samples for training.")

        # Train Random Forest
        # 50 trees, max depth 15 is robust and extremely fast in sci-kit learn
        clf = RandomForestClassifier(n_estimators=50, max_depth=15, random_state=42, n_jobs=-1)
        clf.fit(X, y)

        # OOB or train accuracy proxy
        acc = clf.score(X, y)
        acc_pct = round(acc * 100)

        # In Python, we can't easily export to a JSON format that `ml-random-forest` JS reads...
        # Wait, the frontend/JS needs to predict using this!
        # If we use python to train, we must use python to predict, OR export to a compatible format.
        # Let's save it as a custom JSON that our JS can read, OR just use `joblib` and
        # a python prediction child_process too.
        # A better alternative: JS `random-forest` library... NO, let's use JS but run it in a separate process
        # Wait, if `ml-random-forest` hangs, another JS RF might not. Let's do python prediction script too later.
        
        # ACTUALLY JS Random Forest predict() expects a specific format.
        # Let's just return success for now to test if python works.
    except Exception as e:
        print(f"Error: {str(e)}")
        sys.exit(1)

if __name__ == '__main__':
    main()
