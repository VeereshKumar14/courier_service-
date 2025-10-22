import { PricingService } from '../../src/services/pricing.js'
import { Package } from '../../src/domain/models.js'

describe('PricingService', () => {
  test('calculates delivery cost correctly', () => {
    const service = new PricingService()
    const pkg = new Package('PKG1', 10, 20, 'NA')
    // cost = baseCost(100) + weight*10(100) + distance*5(100)
    expect(service.deliveryCost(100, pkg)).toBe(300)
  })

  test('applies discount when offer policy matches', () => {
    // Create a fake policy that always gives 10%
    const fakePolicy = { getDiscountPercent: () => 10 }
    const service = new PricingService({ offerPolicy: fakePolicy })
    const pkg = new Package('PKG2', 5, 5, 'OFR001')
    // cost = 100 + (5*10=50) + (5*5=25) = 175
    // discount = 10% of 175 = 17.5 → rounded to 18
    expect(service.discountAmount(100, pkg)).toBe(18)
  })

  test('returns 0 discount when offer policy gives 0%', () => {
    const fakePolicy = { getDiscountPercent: () => 0 }
    const service = new PricingService({ offerPolicy: fakePolicy })
    const pkg = new Package('PKG3', 5, 5, 'INVALID')
    expect(service.discountAmount(100, pkg)).toBe(0)
  })

  test('calculates final cost correctly with discount', () => {
    const fakePolicy = { getDiscountPercent: () => 10 }
    const service = new PricingService({ offerPolicy: fakePolicy })
    const pkg = new Package('PKG4', 5, 5, 'OFR001')
    // cost = 175, discount = 18 → final = 175 - 18 = 157 (rounded)
    expect(service.finalCost(100, pkg)).toBe(157)
  })

  test('calculates final cost correctly when no discount', () => {
    const fakePolicy = { getDiscountPercent: () => 0 }
    const service = new PricingService({ offerPolicy: fakePolicy })
    const pkg = new Package('PKG5', 10, 20, 'NA')
    // cost = 100 + (10*10) + (20*5) = 100 + 100 + 100 = 300
    expect(service.finalCost(100, pkg)).toBe(300)
  })
})
