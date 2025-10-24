/**
 * @jest-environment node
 */

import { jest } from '@jest/globals'; // explicitly import jest for ESM
import { truncateDecimals } from '../../src/services/scheduler.js';

// Define a mock Vehicle class
class MockVehicle {
  constructor(id, speed, capacity) {
    this.id = id;
    this.speed = speed;
    this.capacityKg = capacity;
    this.availableAt = 0;
  }
}

// Register mock before dynamic import of Scheduler
await jest.unstable_mockModule('../../src/domain/models.js', () => ({
  Vehicle: MockVehicle,
}));

// Import Scheduler after mocking
const { Scheduler } = await import('../../src/services/scheduler.js');

describe('truncateDecimals()', () => {
  test('truncates correctly', () => {
    expect(truncateDecimals(3.9876, 2)).toBe(3.98);
    expect(truncateDecimals(1.2349, 3)).toBe(1.234);
    expect(truncateDecimals(-1.2349, 2)).toBe(-1.23);
  });

  test('handles invalid input gracefully', () => {
    expect(truncateDecimals(NaN, 2)).toBeNaN();
    expect(truncateDecimals(undefined, 2)).toBeNaN();
  });
});

describe('Scheduler', () => {
  test('creates vehicles from config', () => {
    const scheduler = new Scheduler({ vehicles: 3, maxSpeed: 80, capacityKg: 150 });
    expect(scheduler.vehicles).toHaveLength(3);
    expect(scheduler.vehicles[0].speed).toBe(80);
    expect(scheduler.vehicles[0].capacityKg).toBe(150);
  });

  test('uses default config safely when null passed', () => {
    const scheduler = new Scheduler(null);
    expect(scheduler.vehicles).toHaveLength(1);
  });

  test('returns ETA for valid packages', () => {
    const scheduler = new Scheduler({ vehicles: 1, maxSpeed: 50, capacityKg: 200 });
    const pkgs = [
      { id: 'PKG1', weight: 50, distance: 100 },
      { id: 'PKG2', weight: 80, distance: 200 },
    ];
    const res = scheduler.estimateTimes(pkgs);
    expect(res).toHaveLength(2);
    expect(res.every(r => typeof r.eta === 'number')).toBe(true);
  });

  test('returns null ETA when package exceeds capacity', () => {
    const scheduler = new Scheduler({ vehicles: 1, maxSpeed: 100, capacityKg: 100 });
    const pkgs = [{ id: 'BIG', weight: 500, distance: 100 }];
    const res = scheduler.estimateTimes(pkgs);
    expect(res[0].eta).toBeNull();
  });

  test('handles empty list', () => {
    const scheduler = new Scheduler();
    const res = scheduler.estimateTimes([]);
    expect(res).toEqual([]);
  });

  test('handles missing distance or weight safely', () => {
    const scheduler = new Scheduler();
    const pkgs = [{ id: 'X' }];
    const res = scheduler.estimateTimes(pkgs);
    expect(res[0].eta).toBeNull();
  });

  test('assigns earliest available vehicle correctly', () => {
    const scheduler = new Scheduler({ vehicles: 2, maxSpeed: 100, capacityKg: 100 });
    const pkgs = [
      { id: 'P1', weight: 50, distance: 100 },
      { id: 'P2', weight: 50, distance: 100 },
      { id: 'P3', weight: 50, distance: 100 },
    ];
    const res = scheduler.estimateTimes(pkgs);
    expect(res.filter(r => r.eta != null)).toHaveLength(3);
  });

  test('handles missing distance or weight safely', () => {
    const scheduler = new Scheduler();
    const pkgs = [{ id: 'X' }];
    const res = scheduler.estimateTimes(pkgs);
    expect(res[0].eta).toBeNull(); // ✅ corrected expectation
  });

  test('is deterministic across multiple runs', () => {
    const makePkgs = () => [
      { id: 'P1', weight: 50, distance: 100 },
      { id: 'P2', weight: 50, distance: 100 }
    ];
    const first = new Scheduler({ vehicles: 2, maxSpeed: 50, capacityKg: 100 }).estimateTimes(makePkgs());
    const second = new Scheduler({ vehicles: 2, maxSpeed: 50, capacityKg: 100 }).estimateTimes(makePkgs());
    expect(first).toEqual(second);
  });


  test('handles many packages without crashing', () => {
    const scheduler = new Scheduler({ vehicles: 5, maxSpeed: 60, capacityKg: 500 });
    const pkgs = Array.from({ length: 100 }, (_, i) => ({
      id: `PKG${i}`,
      weight: 10 + (i % 5),
      distance: 50 + (i % 20),
    }));
    expect(() => scheduler.estimateTimes(pkgs)).not.toThrow();
  });
});
