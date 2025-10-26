# Courier Service (Node.js, SOLID, Clean Code)

A small, dependency-free CLI to compute **delivery cost** (with offers) and **estimated delivery time** using the problem statement from the *Courier Service* challenge.

## Quick Start

```bash
# Using Node 18+
cd courier-service-js

npm ci
npm test       # run all tests
npm run lint   # check code quality

```

## Run CLI

### From file:
```bash 
npm start -- examples/sample1.in
```
### From stdin (pipe):
```bash
cat examples/sample2.in | npm start
```
#### Example Output
```yaml
Delivery Cost & Time Estimates

pkg_id   discount   total_cost   ETA(hrs)
------------------------------------------
PKG1     0          750          3.98
PKG2     0          1475         1.78
PKG3     0          2350         1.42
PKG4     105        1395         0.85
PKG5     0          2125         4.19

Done!
```


## Run with Docker

### Build the image:
```bash
docker build -t courier-service:latest . 
```
### Run the CLI:
```bash
docker run --rm -i courier-service:latest < examples/sample1.in 
```
### interactive mode:
```bash
docker run -it courier-service:latest
```

## Tests & Coverage
```bash
npm test
```
Run `npm test` to verify both sample scenarios and compare with expected output.

## Input format

- Line 1: `base_delivery_cost no_of_packages`
- Next N lines: `pkg_id weight_kg distance_km offer_code`
- Optional final line (to also compute times): `no_of_vehicles max_speed_kmph max_carriable_weight_kg`

See `examples/` for ready-made inputs.

## Output format
Per package (in input order):
```
pkg_id discount total_cost [estimated_time_hours]
```

- Costs are rounded to 0 decimals.
- Times are **truncated** to 2 decimals (e.g. 3.456 → 3.45).


## Versioning
Previous: 1.0.0 
- A small, dependency-free CLI to compute **delivery cost** (with offers) and **estimated delivery time** using the problem statement from the *Courier Service* challenge.   

Updated: 1.1.0 —
Improvements made based on panel feedback:
- Added version control friendly files (.gitignore)
- Interactive CLI (works for piped input and interactive/manual input)
- Improved input validation and user-friendly error messages
- Offer information moved to external config (`src/config/offers.json`)
- Scheduler optimized: uses a per-vehicle 0/1 knapsack-based batch selection (improves over brute-force)
- Core scheduler logic covered by unit tests
- Lint errors fixed

## 🚚 Scheduling Algorithm Overview
The delivery scheduling uses a **greedy + priority queue** approach:
- Packages are sorted by weight (heaviest first)
- Vehicles are assigned based on earliest availability
- Delivery time = distance / speed; vehicle becomes available after a round trip

This ensures balanced vehicle utilization and faster delivery completion.
