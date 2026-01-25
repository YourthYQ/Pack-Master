# Pack Master


**Pack Master** is a full‑stack web app for **3D bin packing and palletization**: it helps warehouse and logistics teams decide how to arrange boxes on pallets so that space is used efficiently, labels stay visible for scanning, and shipments are ready for air or sea freight.

You provide box sizes (by hand or via an Excel catalog), choose transport and pallet type, and the app returns one or more **3D placements**—each box has a position and orientation on the pallet. An interactive **Plotly 3D** view lets you inspect the layout and switch between pallets. The backend uses a **Biased Random‑Key Genetic Algorithm (BRKGA)** combined with a greedy 3D placement heuristic: it explores different placement orders and orientations, keeps boxes stable (full support from below) and label faces visible, and minimizes gaps. When a pallet is full, remaining boxes are automatically assigned to additional pallets.

The project demonstrates **full‑stack development** (React + Vite on the front end, Flask REST API on the back end), **algorithm design and implementation** (BRKGA, fitness, 8-way orientation, support and visibility constraints), and **practical UX** (step-by-step wizard, file upload, manual entry, and 3D visualization).

[![React](https://img.shields.io/badge/React-18-61dafb?logo=react)](https://react.dev/)
[![Flask](https://img.shields.io/badge/Flask-3-000?logo=flask)](https://flask.palletsprojects.com/)
[![Plotly](https://img.shields.io/badge/Plotly-3D-3f4f75)](https://plotly.com/javascript/)

---

## Features

- **3D visualization** — Plotly.js interactive view; switch between multiple pallets with arrow keys.
- **Two input modes** — **Manual:** enter box dimensions in the UI. **File:** upload an Excel (`.xlsx`) with your catalog.
- **Transport & pallet presets** — Air/Sea and Plastic/Wooden pallet profiles (size/height).
- **BRKGA** — Biased Random-Key Genetic Algorithm for placement order; greedy 3D placement with 8 orientations, support and label-visibility constraints.
- **Multi-pallet** — Automatically splits boxes across pallets when one is full.

---

## Tech Stack

| Layer    | Technologies |
|----------|--------------|
| **Frontend** | React 18, Vite, React Router, Ant Design, Bootstrap, Plotly (react-plotly.js), Axios |
| **Backend**  | Flask, Flask-CORS, Pandas, NumPy, Openpyxl |
| **Algorithm**| BRKGA, 3D placement heuristics, fitness (volume, utilization, label-facing, gaps) |

---

## Architecture

```
┌─────────────┐      POST /palletize      ┌─────────────┐     BRKGA + Placement     ┌──────────────┐
│   React     │  ──── JSON or FormData ──►│   Flask     │  ──── decode, fitness ───►│  best_       │
│   (Vite)    │  ◄─── best_solutions ──── │   app       │  ◄─── solutions,          │  solutions   │
└─────────────┘                           └─────────────┘     remaining_boxes       └──────────────┘
```

The frontend wizard collects input (manual boxes or file + transport + pallet type), sends it to `/palletize`, and renders `best_solutions` in 3D. The backend runs BRKGA in a loop: each run fills one pallet; the rest is passed to the next run. See [docs/ALGORITHM.md](docs/ALGORITHM.md) for the algorithm.

---

## Getting Started

### Prerequisites

- **Node.js** 18+ and **npm**
- **Python** 3.10+ with **pip**

### 1. Clone and install

```bash
git clone https://github.com/YourthYQ/Pack-Master.git
cd Pack-Master
```

### 2. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt
pip install Flask Flask-Cors pandas numpy openpyxl python-dotenv
```

Optional: copy `backend/.env.example` to `backend/.env` and set `FLASK_RUN_PORT` (default 5000).

```bash
flask run
```

Backend runs at `http://127.0.0.1:5000`.

### 3. Frontend

```bash
cd frontend
npm install
```

Optional: copy `frontend/.env.example` to `frontend/.env` and set `VITE_API_URL` (default `http://127.0.0.1:5000`).

```bash
npm run dev
```

Open the URL printed by Vite (e.g. `http://localhost:5173`).

---

## API

### `POST /palletize`

Packs boxes onto pallets and returns 3D placements.

#### 1) File upload (FormData)

| Field         | Type   | Description |
|---------------|--------|-------------|
| `file`        | File   | `.xlsx` only. Must use the [expected Excel format](#excel-format). |
| `pallet_dims` | string | JSON: `{"length":48,"width":40,"height":57}`. |

Response:

```json
{
  "pallet_dims": [l, w, h],
  "best_solutions": [
    [
      { "id": 1, "position": [x,y,z], "orientation": [a,b,c], "length": L, "width": W, "height": H },
      ...
    ],
    ...
  ]
}
```

#### 2) Manual (JSON)

| Field         | Type  | Description |
|---------------|-------|-------------|
| `boxes`       | array | `[{ "length": 10, "width": 8, "height": 6 }, ...]` |
| `pallet_dims` | array | `[48, 40, 57]` (L, W, H). |

Same response shape as above.

#### Errors

All errors use `{ "error": "message", "code": "CODE" }` with HTTP 4xx/5xx. Examples: `INVALID_FILE`, `FILE_PARSE_ERROR`, `INVALID_INPUT`, `NO_BOXES`.

---

## Data Formats

### Excel format (file upload)

- **Format:** `.xlsx` only.
- **Sheet:** second sheet (`sheet_names[1]`).
- **Header row:** skip the first row; expect at least:
  - `Part# `, `Qty`, `Master carton Qty`
  - `Master carton  Dimension (in)` (length), `Unnamed: 5` (width), `Unnamed: 6` (height)
  - `Master carton weight (lb)` (optional for placement).
- **Logic:** `ceil(Qty / Master carton Qty)` = number of boxes per part; one box per row’s dimensions.

A sample file with this layout is included: **`DimWgt for API testing.xlsx`**.

### Manual JSON

```json
{
  "boxes": [
    { "length": 12, "width": 10, "height": 8 },
    { "length": 10, "width": 8, "height": 6 }
  ],
  "pallet_dims": [48, 40, 57]
}
```

Use consistent units (e.g. inches) for both boxes and pallet.

---

## How to Run With Sample Data

### Manual

1. Start backend and frontend (see above).
2. In the app: **Services → Let’s start → I know the dimensions**.
3. Add boxes, e.g. `12 × 10 × 8` and `10 × 8 × 6`, then **Next**.
4. Choose **Air** or **Sea**, then **Plastic** or **Wooden**.
5. **Palletize Now**. Inspect the 3D view; use **← / →** to change pallet.

### File

1. Use **`DimWgt for API testing.xlsx`** in the repo (or your own `.xlsx` matching the [Excel format](#excel-format)).
2. **Services → I have a database** → pick **Air/Sea** and **Plastic/Wooden** → **Upload** the file → **Submit** → **Palletize Now**.

---

## Algorithm (short)

Placement is driven by a **Biased Random-Key Genetic Algorithm (BRKGA)**:

1. **Encoding:** one random key per box; keys (with volume-based sorting) define placement order.
2. **Decode:** for that order, place each box with a greedy 3D heuristic: 8 orientations, overlap/support checks, and a “label face” visibility rule.
3. **Fitness:** volume + utilization + label-facing reward − gap and placement penalties.
4. **Evolution:** elite selection, biased crossover, mutation; repeat for a few generations. Remaining boxes are packed on further pallets by re-running BRKGA.

Hyperparameters in code: `population_size=4`, `max_generations=2`, `mutation_rate=0.07`. For more detail, see **[docs/ALGORITHM.md](docs/ALGORITHM.md)**.

---

## Known Limitations

- **Excel only** for file import; the parser expects the exact columns and second sheet described above. CSV is not supported.
- **Pallet presets:** Air/Sea and Plastic/Wooden currently only change height; other dimensions are fixed in the frontend.
- **Scalability:** large sets of boxes or big pallets can be slow; BRKGA is tuned for quick response.

---

## Run with Make (optional)

From the repo root:

```bash
make backend   # Flask in backend/
make frontend  # Vite in frontend/
```

Ensure `backend/venv` exists and is activated when using `make backend`.

---

## License

MIT. See [LICENSE](LICENSE) for details.
