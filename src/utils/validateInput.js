function validatePackage(pkg) {
  const { id, weight, distance } = pkg;
  if (!id || isNaN(weight) || isNaN(distance)) {
    throw new Error(`Invalid package input: ${JSON.stringify(pkg)}`);
  }
  if (weight <= 0 || distance <= 0) {
    throw new Error(`Weight and distance must be positive for package ${id}`);
  }
}

function validateVehicleConfig(config) {
  const { vehicles, maxSpeed, maxWeight } = config;
  if (!vehicles || !maxSpeed || !maxWeight) {
    throw new Error('Vehicle configuration is incomplete');
  }
  if (vehicles <= 0 || maxSpeed <= 0 || maxWeight <= 0) {
    throw new Error('Vehicle configuration values must be positive');
  }
}

module.exports = { validatePackage, validateVehicleConfig };
