import random
import csv

random.seed(42)


def infer_risk(heart_rate, steps, sleep, medicine):
    if heart_rate > 110 and steps < 2500 and sleep < 5.5:
        return "HIGH"
    if heart_rate >= 105 and (steps < 3000 or sleep < 5):
        return "HIGH"

    if 58 <= heart_rate <= 92 and steps >= 4500 and sleep >= 7 and medicine == 1:
        return "LOW"
    if heart_rate < 60 and steps >= 5000 and sleep >= 7:
        return "LOW"

    return "NORMAL"


rows = []
for _ in range(150):
    profile = random.random()

    if profile < 0.3:
        # Higher-risk profile
        heart_rate = random.randint(100, 130)
        steps = random.randint(0, 3200)
        sleep = round(random.uniform(3, 6), 1)
        medicine = random.choice([0, 0, 1])
    elif profile < 0.65:
        # Normal profile
        heart_rate = random.randint(68, 104)
        steps = random.randint(1800, 5500)
        sleep = round(random.uniform(5.5, 7.5), 1)
        medicine = random.choice([0, 1])
    else:
        # Lower-risk profile
        heart_rate = random.randint(50, 85)
        steps = random.randint(4500, 7000)
        sleep = round(random.uniform(7, 9), 1)
        medicine = 1

    risk = infer_risk(heart_rate, steps, sleep, medicine)
    rows.append([heart_rate, steps, sleep, medicine, risk])

with open("health_data.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(["heart_rate", "steps", "sleep", "medicine", "risk"])
    writer.writerows(rows)

print(f"Created health_data.csv with {len(rows)} rows")
