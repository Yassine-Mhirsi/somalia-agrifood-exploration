# AI / Tools Utilization

This file documents how AI and tooling were used in this project, with pointers to the core implementation files.

## AI Components

### 1) Region name matching (ETL)

**Where:** `etl/ai_components/region_matcher.py`  
**Purpose:** Match admin1 region names across datasets to avoid hard‑coding a manual mapping.  
**Model:** Gemini 2.5 Flash via OpenAI‑compatible client  
**Why:** The two datasets use slightly different region labels; an LLM is well‑suited for fuzzy semantic matching and can output a clean JSON mapping.

### 2) Commodity filtering (ETL)

**Where:** `etl/ai_components/commodity_filter.py`  
**Purpose:** Filter commodity lists to retain agrifood‑relevant items before integration.  
**Model:** Gemini 2.5 Flash via OpenAI‑compatible client  
**Why:** The raw commodity list is long and includes items outside the agrifood scope; a model can categorize and filter them faster than manual labeling.

### 3) Visualization analysis (Backend)

**Where:** `backend/app/ai/visualization_analyzer.py`  
**Purpose:** Summarize charts based on a screenshot plus chart metadata (title, type).  
**Model:** Gemini 2.5 Flash (multimodal)  
**Why:** Adds a useful AI‑powered explanation layer for decision‑makers, turning visual patterns into concise insight.

## Tooling & Libraries

- **OpenAI‑compatible client** used to access Gemini models  
  Docs: https://ai.google.dev/gemini-api/docs/openai

- **Cursor** (AI coding IDE) for rapid iteration and code assistance  
  Used to accelerate scaffolding and refactoring while keeping manual supervision.

## Notes

- AI is used as an *assistive* component, not a black box replacement.  
- All AI outputs are validated and used as part of deterministic pipelines.  
- Models can be swapped later due to OpenAI compatibility (minimal code changes).
