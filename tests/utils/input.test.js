import { parseInput } from '../../src/utils/input.js'
import { Package } from '../../src/domain/models.js'



describe('parseInput', () => {
    // Positive test: valid input with vehicle config
    test('parses input with vehicle config correctly', () => {
        const lines = [
            '100 2',                     // base cost + number of packages
            'PKG1 5 5 OFR001',           // pkg 1
            'PKG2 15 10 OFR002',         // pkg 2
            '2 70 200'                   // vehicle line
        ]

        const { baseCost, pkgs, vehicleConfig } = parseInput(lines)
        
        // Base cost
        expect(baseCost).toBe(100)

        // Package array
        expect(pkgs).toHaveLength(2)
        expect(pkgs[0]).toBeInstanceOf(Package)
        expect(pkgs[0]).toMatchObject({ id: 'PKG1', weight: 5, distance: 5, offerCode: 'OFR001' })
        expect(pkgs[1]).toMatchObject({ id: 'PKG2', weight: 15, distance: 10, offerCode: 'OFR002' })

        // Vehicle config
        expect(vehicleConfig).toEqual({ vehicles: 2, maxSpeed: 70, capacityKg: 200 })
    })

    // Positive test: valid input without vehicle config
    test('parses input without vehicle config', () => {
        const lines = [
            '50 1',
            'PKG3 10 20 NA'
        ]

        const { baseCost, pkgs, vehicleConfig } = parseInput(lines)
        expect(baseCost).toBe(50)
        expect(pkgs).toHaveLength(1)
        expect(pkgs[0]).toMatchObject({ id: 'PKG3', weight: 10, distance: 20, offerCode: 'NA' })
        expect(vehicleConfig).toBeNull()
    })

    // Negative test: insufficient lines (throws error)
    test('throws error when fewer than 2 lines', () => {
        const lines = ['100'] // only one line

        expect(() => parseInput(lines)).toThrow('Insufficient input')
    })

    // Negative test: number of packages mismatch
    test('handles fewer package lines than declared', () => {
        const lines = [
            '100 2',
            'PKG1 5 5 OFR001' // only one package provided instead of 2
        ]

        // This will likely throw when it tries to read line 2
        expect(() => parseInput(lines)).toThrow()
    })

    // Negative test: malformed vehicle config (ignored)
    test('ignores incomplete vehicle line', () => {
        const lines = [
            '100 1',
            'PKG1 5 5 OFR001',
            '2 70' // missing capacity
        ]

        const { vehicleConfig } = parseInput(lines)
        expect(vehicleConfig).toBeNull()
    })
})