export class Package {
  constructor(id, weight, distance, offerCode) {
    this.id = id;
    this.weight = weight;
    this.distance = distance;
    this.offerCode = (offerCode || 'NA').toUpperCase();
  }
}

export class Shipment {
  // group of packages scheduled on a vehicle at the same start time
  constructor(packages = []) {
    this.packages = packages;
  }
  totalWeight() {
    return this.packages.reduce((s, p) => s + p.weight, 0);
  }
  maxDistance() {
    return this.packages.reduce((m, p) => Math.max(m, p.distance), 0);
  }
}

export class Vehicle {
  constructor(id, speed, capacityKg) {
    this.id = id;
    this.speed = speed;
    this.capacityKg = capacityKg;
    this.availableAt = 0; // hours
  }
}
