export type Coordinates = {
    longitude: number,
    latitude: number
}

const getDistance = (
    start: Coordinates,
    end: Coordinates,
    accuracy: number = 1
): number => {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const R = 6_371_000;

    const phi1 = toRad(start.latitude);
    const phi2 = toRad(end.latitude);
    const deltaPhi = phi2 - phi1;
    const deltaLambda = toRad(end.longitude - start.longitude);

    const a =
        Math.sin(deltaPhi / 2) ** 2 +
        Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const d = R * c;
    return Math.round(d / accuracy) * accuracy;
}

export const getDistanceFast = (start: Coordinates, end: Coordinates): number =>  {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const R = 6_371_000;

    const phi1 = toRad(start.latitude);
    const phi2 = toRad(end.latitude);
    const deltaPhi = phi2 - phi1;
    const deltaLambda = toRad(end.longitude - start.longitude);
    const meanLat = (phi1 + phi2) / 2;

    const x = deltaLambda * Math.cos(meanLat);
    const y = deltaPhi;
    return Number((Math.sqrt(x * x + y * y) * R).toFixed(2));
}

export default getDistance;