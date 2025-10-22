import { formatCostLine } from '../../src/utils/output.js'

describe('formatCostLine', () => {
  test('formats line with eta', () => {
    const pkg = { id: 'PKG1' }
    const result = formatCostLine(pkg, 10, 200, 1.756)
    expect(result).toBe('PKG1 10 200 1.76') // rounded to 2 decimals
  })

  test('formats line without eta when eta is null', () => {
    const pkg = { id: 'PKG2' }
    const result = formatCostLine(pkg, 0, 175, null)
    expect(result).toBe('PKG2 0 175')
  })

  test('formats line without eta when eta is undefined', () => {
    const pkg = { id: 'PKG3' }
    const result = formatCostLine(pkg, 5, 300)
    expect(result).toBe('PKG3 5 300')
  })

  test('works with zero discount and zero total', () => {
    const pkg = { id: 'PKG4' }
    const result = formatCostLine(pkg, 0, 0, 2)
    expect(result).toBe('PKG4 0 0 2.00')
  })

  test('handles negative values', () => {
    const pkg = { id: 'PKG5' }
    const result = formatCostLine(pkg, -5, -100, -1.234)
    expect(result).toBe('PKG5 -5 -100 -1.23')
  })
})
