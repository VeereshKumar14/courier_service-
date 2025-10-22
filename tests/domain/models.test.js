import { Package, Shipment, Vehicle } from '../../src/domain/models.js'

describe('Package', () => {
  test('creates a package with provided offer code', () => {
    const pkg = new Package('PKG1', 10, 50, 'ofr001')
    expect(pkg.id).toBe('PKG1')
    expect(pkg.weight).toBe(10)
    expect(pkg.distance).toBe(50)
    expect(pkg.offerCode).toBe('OFR001') // should be uppercased
  })

  test('defaults offer code to NA if missing', () => {
    const pkg = new Package('PKG2', 5, 20)
    expect(pkg.offerCode).toBe('NA')
  })
})

describe('Shipment', () => {
  test('computes total weight and max distance', () => {
    const pkgs = [
      new Package('PKG1', 10, 30, 'NA'),
      new Package('PKG2', 20, 40, 'NA'),
      new Package('PKG3', 5, 25, 'NA')
    ]
    const shipment = new Shipment(pkgs)

    expect(shipment.totalWeight()).toBe(35) // 10 + 20 + 5
    expect(shipment.maxDistance()).toBe(40) // max(30,40,25)
  })

  test('handles empty shipment gracefully', () => {
    const shipment = new Shipment([])
    expect(shipment.totalWeight()).toBe(0)
    expect(shipment.maxDistance()).toBe(0) // reduce with Math.max on empty array
  })
})

describe('Vehicle', () => {
  test('creates vehicle with default availableAt = 0', () => {
    const vehicle = new Vehicle('V1', 70, 200)
    expect(vehicle.id).toBe('V1')
    expect(vehicle.speed).toBe(70)
    expect(vehicle.capacityKg).toBe(200)
    expect(vehicle.availableAt).toBe(0)
  })
})