import readline from 'readline'
import { Package } from '../domain/models.js'

/**
 * Parse input lines into structured data
 * Expected input format:
 *   base_delivery_cost no_of_packages
 *   pkg_id weight_kg distance_km offer_code
 *   ...
 *   [optional: no_of_vehicles max_speed_kmph max_carriable_weight_kg]
 */ 

export function parseInput(lines) {
  // Remove blank lines and trim spaces
  const clean = lines.map(line => line.trim()).filter(Boolean);
  if (clean.length < 2) throw new Error('Insufficient input');
  
  // base cost and number of packages
  const [baseCostStr, nStr] = clean[0].split(/\s+/);
  const baseCost = Number(baseCostStr);
  const num = Number(nStr);

  // Next n lines: package data
  const pkgs = [];
  for (let i = 1; i <= num; i++) {
    const [id, weight, delivery, offer_code] = clean[i].split(/\s+/);
    // Create Package objects with numeric weight/distance
    pkgs.push(new Package(id, Number(weight), Number(delivery), offer_code));
  }

  // vehicle config (last line)
  let vehicleLine = clean[num + 1];
  let vehicleConfig = null;
  if (vehicleLine) {
    const [vehiclesStr, speedStr, capStr] = vehicleLine.split(/\s+/);
    // Only set if all 3 values are present
    if ([vehiclesStr, speedStr, capStr].every(Boolean)) {
      vehicleConfig = {
        vehicles: Number(vehiclesStr),
        maxSpeed: Number(speedStr),
        capacityKg: Number(capStr),
      };
    }
  }

  return { baseCost, pkgs, vehicleConfig };
}

/**
 * Read full input from stdin asynchronously.
 */
export function readAllStdin() {
  return new Promise(resolve => {
    let data = ''
    const rl = readline.createInterface({ input: process.stdin, terminal: false })
    rl.on('line', line => { data += line + '\n' })
    rl.on('close', () => resolve(data))
  })
}