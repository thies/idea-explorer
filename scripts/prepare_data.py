"""
Prepare corpus and ideas data for the idea explorer web app.
Run from the idea-explorer/ directory: python3 scripts/prepare_data.py
"""
import pandas as pd
import json
import os

DATA_DIR = '../data'
OUT_DIR  = 'public/data'
os.makedirs(OUT_DIR, exist_ok=True)

# ── Corpus background ─────────────────────────────────────────────────────────
corpus = pd.read_csv(f'{DATA_DIR}/combined_space.csv')
corpus = corpus[corpus['is_editorial'] != True]
corpus = corpus[corpus['umap_x'] < 15]   # exclude book-review outliers (same filter as R plots)
corpus = corpus[['umap_x', 'umap_y', 'journal', 'title', 'year_int']].dropna(subset=['umap_x', 'umap_y'])
corpus['umap_x'] = corpus['umap_x'].round(4)
corpus['umap_y'] = corpus['umap_y'].round(4)
corpus.to_json(f'{OUT_DIR}/corpus.json', orient='records')
print(f'corpus.json  {len(corpus):,} rows  {os.path.getsize(OUT_DIR+"/corpus.json")//1024} KB')

# ── Ideas ─────────────────────────────────────────────────────────────────────
ideas = pd.read_csv(f'{DATA_DIR}/research_ideas_v2.csv')
ideas.insert(0, 'id', range(len(ideas)))

# Keep only columns used by the app
keep_cols = [
    'id', 'condition', 'constrained',
    'research_question', 'method', 'data', 'key_finding', 'novelty_rationale',
    'atypicality_score', 'feasibility_score', 'composite_score',
    'nn_dist', 'nn_doi', 'nn_title',
    'assigned_cluster', 'assigned_label',
    'umap_x', 'umap_y',
]
ideas = ideas[[c for c in keep_cols if c in ideas.columns]]

for col in ['atypicality_score', 'feasibility_score', 'composite_score',
            'nn_dist', 'umap_x', 'umap_y']:
    if col in ideas.columns:
        ideas[col] = ideas[col].round(4)

# Replace NaN with None so JSON doesn't output "NaN" strings
ideas = ideas.where(pd.notna(ideas), other=None)
ideas.to_json(f'{OUT_DIR}/ideas.json', orient='records')
print(f'ideas.json   {len(ideas):,} rows  {os.path.getsize(OUT_DIR+"/ideas.json")//1024} KB')
