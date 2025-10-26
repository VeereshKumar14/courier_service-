#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { parseInput } from '../utils/input.js';
import { PricingService } from '../services/pricing.js';
import { Scheduler } from '../services/scheduler.js';
import { OfferPolicy } from '../domain/offers.js';
import { validatePackage, validateVehicleConfig } from '../utils/input.js'

// optional coloring without dependency
const c = {
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
};

function usage() {
  console.log(c.yellow('\n Courier Service CLI'));
  console.log('------------------------------------------');
  console.log('Usage:');
  console.log('  • Run with input file:');
  console.log('      npm start -- <path-to-input-file>');
  console.log('  • OR pipe input:');
  console.log('      cat examples/sample1.in | npm start');
  console.log('\nExample:\n  npm start -- examples/sample2.in\n');
}

async function main() {
  const arg = process.argv[2];
  let raw = '';

  if (arg) {
    const fullPath = path.resolve(arg);
    if (!fs.existsSync(fullPath)) {
      console.error(c.red(`Error: Input file not found → ${fullPath}`));
      usage();
      process.exit(2);
    }
    raw = fs.readFileSync(fullPath, 'utf8');
  } else {
    // Handle stdin (pipe) or no input gracefully
    try {
      const stat = fs.fstatSync(0);
      if (stat.isFile() || stat.isFIFO()) {
        raw = fs.readFileSync(0, 'utf8');
      } else {
        console.error(c.red('No input detected.'));
        usage();
        process.exit(0);
      }
    } catch {
      console.error(c.red(' No input detected.'));
      usage();
      process.exit(0);
    }
  }

  if (!raw.trim()) {
    console.error(c.red('Input file is empty or invalid.'));
    usage();
    process.exit(1);
  }

  // Parse and compute
  let parsed;
  try {
    parsed = parseInput(raw.split('\n'));
  } catch (err) {
    console.error(c.red(`Failed to parse input: ${err.message}`));
    console.log('Expected format:');
    console.log('  base_delivery_cost no_of_packages');
    console.log('  pkg_id weight distance offer_code');
    console.log('  [optional: no_of_vehicles max_speed max_carriable_weight]\n');
    process.exit(1);
  }

  const { baseCost, pkgs, vehicleConfig } = parsed;

  try {
    pkgs.forEach(validatePackage);
    validateVehicleConfig(vehicleConfig);
  } catch (err) {
    console.error(c.red(`Validation error: ${err.message}`));
    process.exit(1);
  }

  const offerPolicy = new OfferPolicy();
  pkgs.forEach(p => { p._discountEligible = offerPolicy.getDiscountPercent(p) > 0; });

  const pricing = new PricingService(offerPolicy);
  const scheduler = new Scheduler(vehicleConfig);

  // Calculate
  const results = pkgs.map(p => {
    const discount = pricing.discountAmount(baseCost, p);
    const total = pricing.finalCost(baseCost, p);
    return { id: p.id, discount, total, distance: p.distance };
  });

  const etas = scheduler.estimateTimes(pkgs);
  results.forEach(r => {
    const eta = etas.find(e => e.id === r.id)?.eta ?? null;
    r.eta = eta;
  });

  console.log(c.green('\n Delivery Cost & Time Estimates\n'));
  console.log('pkg_id   discount   total_cost   ETA(hrs)');
  console.log('------------------------------------------');

  results.forEach(r => {
    const line = `${r.id.padEnd(7)} ${r.discount
      .toString()
      .padEnd(10)} ${r.total.toString().padEnd(12)} ${r.eta ?? ''}`;
    console.log(line);
  });

  console.log('\n' + c.green(' Done!'));
}

// Graceful error handler
main().catch(err => {
  console.error(c.red('Unexpected error occurred.'));
  console.error(err.message || err);
  process.exit(1);
});
