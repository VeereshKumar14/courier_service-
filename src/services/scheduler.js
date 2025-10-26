import MinHeap from 'heap';
import { Vehicle } from '../domain/models.js';

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

    // create actual Vehicle objects
    this.vehicles = Array.from(
      { length: vehicles },
      (_, i) => new Vehicle(i + 1, maxSpeed, capacityKg)
    );
  }

  /**
   * Optimized Greedy Scheduler (using MinHeap)
   * - Sort packages by discountEligible desc, weight desc
   * - Always assign to vehicle that becomes available first (via heap)
   * - Complexity: O(n log v) instead of O(n·v)
   */
  estimateTimes(packages) {
    if (!packages?.length) return [];

    // clone & sort packages by priority
    const pkgs = packages.map(p => ({ ...p }));
    pkgs.sort((a, b) => {
      const da = a._discountEligible ? 1 : 0;
      const db = b._discountEligible ? 1 : 0;
      if (da !== db) return db - da;
      return b.weight - a.weight;
    });

    // init heap comparing by earliest availability, then by id
    const heap = new MinHeap((a, b) => {
      if (a.availableAt !== b.availableAt) return a.availableAt - b.availableAt;
      return a.id - b.id;
    });

    // push all vehicles
    for (const v of this.vehicles) heap.push(v);

    const assignments = {};

    for (const pkg of pkgs) {
      const vehicle = heap.pop(); // earliest available vehicle

      if (pkg.weight <= vehicle.capacityKg) {
        const travelHours = pkg.distance / vehicle.speed;
        const finishAt = vehicle.availableAt + travelHours * 2;
        assignments[pkg.id] = {
          vehicleId: vehicle.id,
          startAt: vehicle.availableAt,
          eta: vehicle.availableAt + travelHours,
        };
        vehicle.availableAt = finishAt;
        heap.push(vehicle); // put it back with updated time
      } else {
        // cannot carry — mark unassigned
        assignments[pkg.id] = { vehicleId: null, startAt: null, eta: null };
        heap.push(vehicle); // still available unchanged
      }
    }

    // return ETAs preserving original order
    return packages.map(p => {
      const a = assignments[p.id];
      return {
        id: p.id,
        eta: a && a.eta != null ? truncateDecimals(a.eta, 2) : null,
      };
    });
  }
}
