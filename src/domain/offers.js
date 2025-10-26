import fs from 'fs';
import path from 'path';

export class OfferPolicy {
  constructor(rules = null) {
    if (!rules) {
      const cfgPath = path.resolve(new URL(import.meta.url).pathname, '../../config/offers.json');
      try {
        const data = fs.readFileSync(cfgPath, 'utf8');
        rules = JSON.parse(data);
      } catch {
        rules = [];
      }
    }
    this.rules = (rules || []).map(r => ({ ...r, code: (r.code || '').toUpperCase() }));
  }

  getDiscountPercent(pkg) {
    const code = (pkg.offerCode || 'NA').toUpperCase();
    const rule = this.rules.find(r => r.code === code);
    if (!rule) return 0;
    const inWeight = !rule.weight || (pkg.weight >= rule.weight[0] && pkg.weight <= rule.weight[1]);
    const inDistance = !rule.distance || (pkg.distance >= rule.distance[0] && pkg.distance <= rule.distance[1]);
    return inWeight && inDistance ? (rule.percent || 0) : 0;
  }
}

// Export default policy so legacy tests still work
export const DefaultOfferPolicy = new OfferPolicy();
export default OfferPolicy;
