/**
 * Menghitung jarak dalam satuan meter antara dua koordinat GPS menggunakan formula Haversine.
 * Mengonversi input secara aman ke number untuk mengantisipasi tipe Prisma.Decimal.
 */
export function calculateDistance(
  lat1: number | string | any,
  lon1: number | string | any,
  lat2: number | string | any,
  lon2: number | string | any
): number {
  const l1 = Number(lat1);
  const ln1 = Number(lon1);
  const l2 = Number(lat2);
  const ln2 = Number(lon2);

  if (isNaN(l1) || isNaN(ln1) || isNaN(l2) || isNaN(ln2)) {
    throw new Error('Koordinat tidak valid untuk perhitungan jarak Haversine');
  }

  const R = 6371e3; // Jari-jari bumi dalam meter
  const φ1 = (l1 * Math.PI) / 180;
  const φ2 = (l2 * Math.PI) / 180;
  const Δφ = ((l2 - l1) * Math.PI) / 180;
  const Δλ = ((ln2 - ln1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c; // dalam meter
  return parseFloat(distance.toFixed(2));
}
