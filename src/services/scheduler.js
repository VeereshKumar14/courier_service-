import { Vehicle } from '../domain/models.js';

/**
 * Greedy scheduler:
 * - Sort packages by (discountEligible desc, weight desc) to prefer high-value items
 * - For each package assign to earliest available vehicle that can accommodate weight (current trip)
 * - Simpler and scales linearly with small log factor for sorting.
 */
export function truncateDecimals(value, decimals) {
  const factor = Math.pow(10, decimals);
  return Math.trunc(value * factor) / factor;
}

export class Scheduler {
  constructor(config = {}) {
    const {
      vehicles = 1,
      maxSpeed = 70,
      capacityKg = 200,
    } = config || {}; 

    this.vehicles = Array.from(
      { length: vehicles },
      (_, i) => new Vehicle(i + 1, maxSpeed, capacityKg)
    );
  }


  // Assigns estimated delivery time in hours for each package given its distance.
  estimateTimes(packages) {
    // Packages: {id, weight, distance, ...}
    // We'll schedule per-package trips (no multi-stop), assign to the vehicle that becomes available the earliest.
    // For more advanced batching, extend this method.
    // Sort packages to improve utilization: prefer higher weight and discount-eligibility
    const pkgs = packages.map(p => ({...p}));
    pkgs.sort((a,b) => {
      const da = (a._discountEligible ? 1 : 0), db = (b._discountEligible ? 1 : 0);
      if (da !== db) return db - da;
      return b.weight - a.weight;
    });

    const assignments = {};
    for (const pkg of pkgs) {
      // find vehicle available earliest that can carry this package weight
      this.vehicles.sort((a,b) => a.availableAt - b.availableAt || a.id - b.id);
      let assigned = null;
      for (const v of this.vehicles) {
        if (pkg.weight <= v.capacityKg) {
          const travelHours = pkg.distance / v.speed;
          const finishAt = v.availableAt + travelHours * 2; // assume out-and-back for next trip
          assignments[pkg.id] = {vehicleId: v.id, startAt: v.availableAt, eta: v.availableAt + travelHours};
          v.availableAt = finishAt;
          assigned = v;
          break;
        }
      }
      if (!assigned) {
        // cannot assign -> mark as null ETA
        assignments[pkg.id] = {vehicleId: null, startAt: null, eta: null};
      }
    }

    // Return ETAs in original package order
    return packages.map(p => {
      const a = assignments[p.id];
      return { id: p.id, eta: a && a.eta != null ? truncateDecimals(a.eta, 2) : null };
    });
  }
}
