# Game Difficulty Auto-Balancing System

A machine-learning-based archery game prototype that adapts difficulty using recent player-performance data. It includes a Next.js frontend, a Node.js/Express backend, a SQLite database, and a Python/FastAPI machine-learning service.

> **Important:** This project currently uses a synthetic gameplay dataset. Results on synthetic data do not guarantee the same performance with real players.

## Features

- Archery-style game with five difficulty levels.
- Gradient Boosting Classifier predicts whether difficulty should decrease (`-1`), remain the same (`0`), or increase (`+1`).
- Gameplay tracking, player authentication, difficulty history, and analytics.
- Admin login and dashboard (if configured in your checkout).

## Technologies

- Frontend: Next.js, React
- Backend: Node.js, Express
- Database: SQLite
- ML: Python, pandas, NumPy, scikit-learn, joblib
- ML API: FastAPI, Uvicorn

## Architecture

```text
Next.js frontend :3000
   |-- gameplay/authentication/analytics --> Node.js + Express :5000 --> SQLite
   `-- ML prediction requests ------------> FastAPI :8000 --> Gradient Boosting Classifier
```

The frontend can call FastAPI directly for predictions. Gameplay records and analytics are handled by the Node.js backend.

## Repository layout

```text
Game-Difficulty-Auto-Balancing/
├── frontend/                 # Next.js game UI and pages
├── backend/                  # Express API, auth, analytics, SQLite
│   ├── data/
│   ├── routes/
│   ├── middleware/
│   ├── server.js
│   └── database.js
├── ML/                       # Python ML service and model
│   ├── api.py
│   ├── generate_dataset.py
│   ├── train_model.py
│   └── models/difficulty_model.joblib
├── .gitignore
├── .env.example
└── README.md
```

This is an illustrative structure; keep the files already present in your working project. If `ML/requirements.txt` does not exist, use the package-install command below.

## Requirements

- Git
- Node.js (tested with Node.js 20) and npm
- Python with the project's ML dependencies installed

## Run the project on Windows

Start **three separate terminals** in VS Code and keep all three running.

### Terminal 1 — Machine-learning API

```powershell
cd ML
python -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install numpy pandas scikit-learn joblib fastapi uvicorn
uvicorn api:app --reload --port 8000
```

If `ML/requirements.txt` exists, you can use `pip install -r requirements.txt` instead of the individual `pip install` command. If PowerShell blocks virtual-environment activation, try `python -m uvicorn api:app --reload --port 8000` after installing packages into the active environment, or follow your organization's PowerShell policy.

ML API address: `http://127.0.0.1:8000`

### Terminal 2 — Backend

```powershell
cd backend
npm install
node server.js
```

Before starting, create `backend/.env` using the root `.env.example` as a template, then replace the placeholder values. Match variable names to the actual backend code in your checkout.

```env
PORT=5000
JWT_SECRET=replace_with_a_long_random_secret
ML_API_URL=http://127.0.0.1:8000
FRONTEND_URL=http://localhost:3000
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=replace_with_a_strong_password
ADMIN_JWT_SECRET=replace_with_another_long_random_secret
```

Use unique secret values. Never commit the real `backend/.env` file or publish passwords and JWT secrets.

Backend address: `http://localhost:5000`

### Terminal 3 — Frontend

```powershell
cd frontend
npm install
npm run dev
```

Open the game at `http://localhost:3000`.

Other pages, if included in your checkout:
- Analytics: `http://localhost:3000/analytics`
- Admin login: `http://localhost:3000/admin-login`

### Quick start after initial setup

Once dependencies and environment variables are set up, run only these commands in three terminals:

```powershell
# Terminal 1 (inside ML, with venv activated)
uvicorn api:app --reload --port 8000
```

```powershell
# Terminal 2 (inside backend)
node server.js
```

```powershell
# Terminal 3 (inside frontend)
npm run dev
```

## Machine-learning features

The classifier uses 14 features:

1. `current_difficulty`
2. `accuracy`
3. `win_rate`
4. `death_rate`
5. `survival_rate`
6. `average_score`
7. `reaction_time`
8. `completion_time`
9. `performance_trend`
10. `consecutive_wins`
11. `consecutive_losses`
12. `recent_accuracy`
13. `recent_win_rate`
14. `recent_score`

| Prediction | Meaning |
|---:|---|
| `-1` | Decrease difficulty |
| `0` | Maintain difficulty |
| `1` | Increase difficulty |

The game controller should validate predictions and apply safeguards before changing difficulty.

## Dataset and model

The project has scripts to generate a synthetic gameplay dataset and train a model. If you want to regenerate them, run the following from inside `ML`:

```powershell
python generate_dataset.py
python train_model.py
```

Training may overwrite the generated dataset or saved model. Back up files you want to keep before retraining. The API expects the saved model at the path configured in `ML/api.py`.

## Database

The backend uses SQLite for player accounts, game sessions, gameplay events, and difficulty history. The local database may be created at `backend/data/game.db`.

Do not publish a database containing real player information, passwords, or private test data. For a public repository, omit the local database and let the application initialize a clean one if its code supports that.

## Troubleshooting

**`uvicorn` is not recognized**
```powershell
python -m uvicorn api:app --reload --port 8000
```

**`npm` or `node` is not recognized**
Install Node.js, restart VS Code, then check:
```powershell
node --version
npm --version
```

**Port already in use**
Stop the other process using the port, or change the port and update the corresponding API URL in the application.

**ML predictions fail**
Check that the ML service is running on port `8000`, the model file exists at the path expected by `ML/api.py`, and the frontend ML URL matches the service address.

**Login or analytics fail**
Check that the backend is running on port `5000`, `backend/.env` is configured, and the browser is using the expected API URL. Review terminal errors.

## Push to GitHub

1. Create a **new empty repository** on GitHub. Do not add a README there if your local project already has one.
2. Put `README.md`, `.gitignore`, and `.env.example` in the project root.
3. From the project root, run:

```powershell
git init
git add README.md .gitignore .env.example
git add frontend backend ML
git status
```

**Review `git status before committing.** Do not continue if it lists `.env`, `node_modules`, `.next`, `venv`, private databases, passwords, or tokens. Fix `.gitignore` and unstage unwanted files first.

Then run:

```powershell
git commit -m "Initial commit: Game Difficulty Auto-Balancing System"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/Game-Difficulty-Auto-Balancing.git
git push -u origin main
```

Replace `YOUR-USERNAME` with your GitHub username. If `origin` already exists, inspect it with `git remote -v` instead of adding it again.

## GitHub safety checklist

- Never commit `.env`, `.env.local`, API keys, passwords, JWT secrets, or tokens.
- Exclude `node_modules/`, `.next/`, `ML/venv/`, `__pycache__/`, and logs.
- Check `backend/data/game.db` for personal or test-account information before publishing.
- Keep `package-lock.json` files.
- Include the saved model only if it is reasonably small and you have permission to publish it.
- Do not include private college documents or student identifiers unless you intend them to be public.

## Team

- S. Mahammad Ali
- Sai Deepika

## Limitations and future work

- Evaluate the model with real gameplay sessions and a separate test dataset.
- Compare against rule-based and alternative ML baselines.
- Add automated tests for API endpoints, authentication, and difficulty-change safeguards.
- Improve deployment configuration and document production security settings.

## License

No license has been selected. Until a license is added, do not assume others have permission to reuse, modify, or redistribute this project.
