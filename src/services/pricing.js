import { OfferPolicy } from '../domain/offers.js';

export class PricingService {
  constructor(options = null) {
    // backward compatibility
    if (options && typeof options === 'object' && 'offerPolicy' in options) {
      this.offerPolicy = options.offerPolicy;
    } else if (options && typeof options.getDiscountPercent === 'function') {
      this.offerPolicy = options;
    } else {
      this.offerPolicy = new OfferPolicy();
    }
  }

  deliveryCost(baseCost, pkg) {
    // Improved: baseCost + weight*10 + distance*5
    return baseCost + pkg.weight * 10 + pkg.distance * 5;
  }

  discountAmount(baseCost, pkg) {
    const cost = this.deliveryCost(baseCost, pkg);
    const percent = this.offerPolicy.getDiscountPercent(pkg);
    return Math.round((cost * percent) / 100);
  }

  finalCost(baseCost, pkg) {
    const cost = this.deliveryCost(baseCost, pkg);
    return Math.round(cost - this.discountAmount(baseCost, pkg));
  }
}
