export function radiusToZoom(radiusKm) {
  if (radiusKm <= 5) return 14;
  if (radiusKm <= 10) return 13;
  if (radiusKm <= 20) return 12;
  if (radiusKm <= 35) return 11;
  if (radiusKm <= 70) return 10;
  return 9;
}