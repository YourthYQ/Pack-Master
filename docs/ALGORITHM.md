# Palletization Algorithm: BRKGA

Pack Master uses a **Biased Random-Key Genetic Algorithm (BRKGA)** to find good 3D box arrangements on pallets. This doc summarizes the main ideas.

---

## 1. What BRKGA Does

- **Input:** A list of boxes (length × width × height) and pallet dimensions (L × W × H).
- **Output:** For each pallet, an ordered list of placements: each box has a position `(x,y,z)` and one of 8 orientations, so that:
  - Boxes do not overlap and stay inside the pallet.
  - Every box (except those on the floor) is fully supported from below.
  - A chosen “label” face of each box is kept visible (not blocked by other boxes).

Boxes that do not fit on the current pallet are packed on further pallets by running the same process on the remaining set.

---

## 2. Encoding and Decode

- **Chromosome:** One random key in `[0,1]` per box. The keys do **not** directly represent positions; they only define an order and bias.
- **Decode (placement):**
  1. Sort boxes by **volume descending** (largest first), then use the random keys as a secondary sort to get a **placement order**.
  2. For each box in that order, try all **8 orientations** (rotations so that the “label” can face front/back/left/right, with height along the main axes).
  3. For each orientation, consider **candidate positions** from a 3D grid (heuristic to limit search). For each candidate `(x,y,z)`:
     - Check **no overlap** with already placed boxes (3D occupancy array).
     - Check **full support** from below (layer `z-1` must be full under the footprint).
     - Check **label visible**: the chosen label face must either touch a pallet boundary or have a clear line to one (not blocked by other boxes).
  4. Among all valid `(position, orientation)` pairs, pick the one with the best **orientation score** (reward for touching walls and filling space; penalty for gaps).
  5. If placing this box would **block the label** of an already placed box, discard this placement and add a **penalty**; the box is then “unplaced” for this pallet and can appear on a later one.

So: **decode = ordered, greedy 3D placement** with 8 orientations, support and label-visibility constraints, plus a simple scoring heuristic for tie‑breaking.

---

## 3. Fitness

For a given placement (one pallet’s worth of boxes), fitness is:

- **Volume** of placed boxes (more is better).
- **Space-utilization reward:** `(box volume / pallet volume) × constant`.
- **Label-facing reward:** For each box, if its label face is oriented toward the nearest pallet side, add a reward.
- **Gap penalty:** Penalty for empty space between boxes along x, y, or z.
- **Placement penalty:** For every box that could not be placed (e.g. because it would block others’ labels), add a large fixed penalty.

Higher total means a better solution.

---

## 4. Evolution (GA Loop)

1. **Initialization:** `population_size` random chromosomes (random keys per box).
2. **Repeat for `max_generations`:**
   - **Decode** each chromosome to a placement; compute **fitness** (including penalties).
   - **Rank** by fitness (descending) and keep the top half (**elite**).
   - **Crossover:** To rebuild the population, pairs of parents (drawn from the elite) undergo **biased crossover**: for each gene, with probability `bias` (e.g. 0.7) take the value from the “better” parent, else from the other.
   - **Mutation:** With probability `mutation_rate`, replace a gene with a new random key.
3. **Best solution:** After the last generation, take the chromosome with the highest fitness. Its decoded placement is the **best_solution** for the first pallet; **remaining_boxes** are those that were never placed. The same BRKGA is run again on `remaining_boxes` to fill the next pallet, and so on.

---

## 5. Main Parameters (Current Code)

- `population_size`: 4  
- `max_generations`: 2  
- `mutation_rate`: 0.07  
- Crossover bias: 0.7 (in `biased_crossover`)

These are small to keep response time low; increasing them can improve solution quality at the cost of runtime.

---

## 6. Scaling (File Import Only)

For **Excel import**, box and pallet sizes are scaled to a coarser 3D grid so that the occupancy checks stay fast. A **scale_ratio** (2 or 3) is chosen to keep volume ratios close to the real ones; then:

- Pallet: `floor(value / scale_ratio)`  
- Box: `ceil(value / scale_ratio)`

Manual input uses `scale_ratio = 1` (no scaling).

---

## 7. References

- BRKGA: *Gonçalves & Resende, “Biased random-key genetic algorithms for combinatorial optimization”, J Heuristics (2011).*
- 3D bin packing and placement constraints (support, visibility) are implemented in `placement.py` and `fitness.py`.
