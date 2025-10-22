
import { Scheduler } from '../../src/services/scheduler.js';

describe('Scheduler (greedy) estimateTimes', () => {
  test('assigns ETAs for simple packages with one vehicle', () => {
    const scheduler = new Scheduler({ vehicles: 1, maxSpeed: 50, capacityKg: 200 });
    const pkgs = [
      { id: 'PKG1', weight: 50, distance: 100 },
      { id: 'PKG2', weight: 70, distance: 50 }
    ];
    const res = scheduler.estimateTimes(pkgs);
    // PKG1 travel time = 100/50=2h, PKG2=50/50=1h. First package scheduled first in sort (weight desc)
    const pkg1 = res.find(r => r.id === 'PKG1');
    const pkg2 = res.find(r => r.id === 'PKG2');
    expect(pkg1.eta).toBeDefined();
    expect(pkg2.eta).toBeDefined();
    expect(pkg1.eta).toBeGreaterThanOrEqual(0);
    expect(pkg2.eta).toBeGreaterThanOrEqual(0);
  });

  test('returns null eta when package exceeds vehicle capacity', () => {
    const scheduler = new Scheduler({ vehicles: 1, maxSpeed: 50, capacityKg: 100 });
    const pkgs = [{ id: 'BIG', weight: 150, distance: 10 }];
    const res = scheduler.estimateTimes(pkgs);
    expect(res[0].eta).toBeNull();
  });
});
