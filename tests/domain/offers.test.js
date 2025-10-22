import { OfferPolicy, DefaultOfferPolicy } from '../../src/domain/offers.js'
import { Package } from '../../src/domain/models.js'

describe('OfferPolicy', () => {
  test('applies matching rule and returns correct discount percent', () => {
    const rules = [
      { code: 'OFR001', percent: 10, weight: [50, 100], distance: [0, 200] }
    ]
    const policy = new OfferPolicy(rules)
    const pkg = new Package('PKG1', 60, 150, 'ofr001')

    expect(policy.getDiscountPercent(pkg)).toBe(10) // matches rule, uppercased automatically
  })

  test('returns 0 if offer code not found', () => {
    const rules = [
      { code: 'OFR001', percent: 10, weight: [50, 100], distance: [0, 200] }
    ]
    const policy = new OfferPolicy(rules)
    const pkg = new Package('PKG2', 60, 150, 'OFRXXX')

    expect(policy.getDiscountPercent(pkg)).toBe(0)
  })

  test('returns 0 if weight out of range', () => {
    const rules = [
      { code: 'OFR001', percent: 10, weight: [50, 100], distance: [0, 200] }
    ]
    const policy = new OfferPolicy(rules)
    const pkg = new Package('PKG3', 120, 150, 'OFR001') // weight too high

    expect(policy.getDiscountPercent(pkg)).toBe(0)
  })

  test('returns 0 if distance out of range', () => {
    const rules = [
      { code: 'OFR001', percent: 10, weight: [50, 100], distance: [0, 200] }
    ]
    const policy = new OfferPolicy(rules)
    const pkg = new Package('PKG4', 60, 250, 'OFR001') // distance too far

    expect(policy.getDiscountPercent(pkg)).toBe(0)
  })

  test('defaults to 0 if offer code is missing', () => {
    const rules = [
      { code: 'OFR001', percent: 10, weight: [50, 100], distance: [0, 200] }
    ]
    const policy = new OfferPolicy(rules)
    const pkg = new Package('PKG5', 60, 150) // no offer code

    expect(policy.getDiscountPercent(pkg)).toBe(0)
  })
})

describe('DefaultOfferPolicy', () => {
  test('OFR001: returns 10% when weight and distance in range', () => {
    const pkg = new Package('PKG6', 100, 100, 'OFR001')
    expect(DefaultOfferPolicy.getDiscountPercent(pkg)).toBe(10)
  })

  test('OFR002: returns 7% when weight/distance match', () => {
    const pkg = new Package('PKG7', 150, 100, 'ofr002')
    expect(DefaultOfferPolicy.getDiscountPercent(pkg)).toBe(7)
  })

  test('OFR003: returns 5% when weight/distance match', () => {
    const pkg = new Package('PKG8', 50, 200, 'OFR003')
    expect(DefaultOfferPolicy.getDiscountPercent(pkg)).toBe(5)
  })

  test('returns 0 when no default rule applies', () => {
    const pkg = new Package('PKG9', 5, 10, 'OFR003') // weight too low
    expect(DefaultOfferPolicy.getDiscountPercent(pkg)).toBe(0)
  })
})