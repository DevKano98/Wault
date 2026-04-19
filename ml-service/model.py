from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import train_test_split

BASE_DIR = Path(__file__).parent
LABEL_MAP = {0: 'LOW', 1: 'MEDIUM', 2: 'HIGH'}


def build_dataset(sample_count: int = 6000):
    rng = np.random.default_rng(42)
    frame = pd.DataFrame(
        {
            'login_count_30d': rng.integers(0, 61, sample_count),
            'days_inactive': rng.uniform(0, 180, sample_count),
            'avg_response_delay': rng.uniform(0, 72, sample_count),
            'prev_triggers': rng.integers(0, 6, sample_count),
        }
    )

    labels = np.zeros(sample_count, dtype=int)

    low_mask = (
        (frame['days_inactive'] <= 6)
        & (frame['login_count_30d'] >= 15)
    )
    labels[low_mask] = 0

    medium_mask = (
        frame['days_inactive'].between(7, 30, inclusive='both')
        | frame['login_count_30d'].between(5, 14, inclusive='both')
    )
    labels[medium_mask] = 1

    high_mask = (
        (frame['days_inactive'] > 30)
        | (frame['login_count_30d'] < 5)
        | (frame['prev_triggers'] >= 1)
    )
    labels[high_mask] = 2

    noise_count = max(1, int(sample_count * 0.03))
    noisy_indices = rng.choice(sample_count, size=noise_count, replace=False)
    labels[noisy_indices] = rng.integers(0, 3, size=noise_count)

    return frame, labels


def main():
    features, labels = build_dataset()

    x_train, x_test, y_train, y_test = train_test_split(
      features,
      labels,
      test_size=0.2,
      random_state=42,
      stratify=labels,
    )

    model = RandomForestClassifier(
        n_estimators=200,
        random_state=42,
        class_weight='balanced',
    )
    model.fit(x_train, y_train)

    predictions = model.predict(x_test)
    print(f'Accuracy: {accuracy_score(y_test, predictions):.4f}')
    print(
        classification_report(
            y_test,
            predictions,
            target_names=list(LABEL_MAP.values()),
        )
    )

    joblib.dump(model, BASE_DIR / 'model.pkl')
    joblib.dump(LABEL_MAP, BASE_DIR / 'label_map.pkl')


if __name__ == '__main__':
    main()
