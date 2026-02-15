# OpenOA Wind Farm Analytics Dashboard

A beautiful, responsive dashboard for wind farm operational analysis using OpenOA.

![Dashboard Preview](https://img.shields.io/badge/Status-Live-brightgreen)

## 🌟 Features

- **Real Data Analysis**: Uses actual La Haute Borne wind farm data (420,480 SCADA records)
- **6 OpenOA Analyses**: 
  - Monte Carlo AEP Estimation
  - Electrical Losses
  - Wake Losses  
  - Turbine Long-Term Gross Energy
  - Static Yaw Misalignment
  - EYA Gap Analysis
- **Interactive Visualizations**: Power curves, wind roses, time series charts
- **Fully Responsive**: Works on mobile, tablet, and desktop
- **Modern Stack**: Next.js 15, FastAPI, Recharts, Tailwind CSS

## 🚀 Deployment

### Frontend (Vercel)

1. **Connect your GitHub repo to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   
2. **Configure the project**:
   - **Root Directory**: `dashboard-frontend`
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   
3. **Set Environment Variables**:
   ```
   NEXT_PUBLIC_API_URL=https://your-render-backend-url.onrender.com
   ```

4. **Deploy**: Click "Deploy"

### Backend (Render)

1. **Connect your GitHub repo to Render**:
   - Go to [render.com](https://render.com)
   - Click "New" → "Web Service"
   - Connect your GitHub repository

2. **Configure the service**:
   - **Name**: `openoa-backend`
   - **Region**: Oregon (or closest)
   - **Branch**: `main`
   - **Root Directory**: (leave empty - use repo root)
   - **Runtime**: Python 3
   - **Build Command**: 
     ```bash
     pip install --upgrade pip && pip install -r dashboard-backend/requirements.txt && pip install -e .
     ```
   - **Start Command**: 
     ```bash
     cd dashboard-backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT
     ```

3. **Environment Variables**:
   - `PYTHON_VERSION`: `3.11`

4. **Deploy**: Click "Create Web Service"

### After Deployment

1. Copy your Render backend URL (e.g., `https://openoa-backend.onrender.com`)
2. Go to your Vercel project → Settings → Environment Variables
3. Update `NEXT_PUBLIC_API_URL` with your Render URL
4. Redeploy the frontend

## 🛠️ Local Development

### Prerequisites
- Node.js 18+
- Python 3.11+
- npm or yarn

### Setup

```bash
# Clone the repo
git clone https://github.com/NatLabRockies/OpenOA.git
cd OpenOA

# Create Python virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install OpenOA
pip install -e .

# Install backend dependencies
pip install -r dashboard-backend/requirements.txt

# Start backend
cd dashboard-backend
uvicorn app.main:app --reload --port 8000

# In another terminal, start frontend
cd dashboard-frontend
npm install
npm run dev
```

Visit http://localhost:3000 to see the dashboard.

## 📊 API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /health` | Health check |
| `GET /api/info` | Plant information |
| `GET /api/data/overview` | Data summary |
| `GET /api/data/scada/summary` | SCADA statistics |
| `GET /api/data/power-curve` | Power curve data |
| `GET /api/data/wind-rose` | Wind rose data |
| `POST /api/run-analysis` | Run OpenOA analysis |

## 📁 Project Structure

```
OpenOA/
├── dashboard-frontend/     # Next.js frontend
│   ├── app/
│   │   ├── page.tsx       # Main dashboard
│   │   └── globals.css    # Global styles
│   ├── vercel.json        # Vercel config
│   └── package.json
├── dashboard-backend/      # FastAPI backend
│   ├── app/
│   │   └── main.py        # API endpoints
│   ├── requirements.txt
│   └── start.sh
├── openoa/                 # OpenOA library
├── examples/data/          # Wind farm data
│   └── la_haute_borne/
└── render.yaml            # Render config
```

## 🌬️ Data Source

**La Haute Borne Wind Farm** (France)
- 4 × Senvion MM82 turbines
- 8.2 MW total capacity
- 80m hub height, 82m rotor diameter
- Data period: 2014-2015

## 📝 License

BSD 3-Clause License - See [LICENSE.txt](LICENSE.txt)

## 🙏 Credits

- [OpenOA](https://github.com/NREL/OpenOA) by NREL
- [La Haute Borne Dataset](https://opendata-renewables.engie.com/)
