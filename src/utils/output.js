/**
 * Format output line: pkg_id discount total [eta]
 */
export function formatCostLine(pkg, discount, total, eta) {
  const parts = [pkg.id, discount, total]
  if (eta != null) parts.push(eta.toFixed(2))
  return parts.join(' ')
}
