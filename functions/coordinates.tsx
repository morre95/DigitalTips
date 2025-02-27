
const EARTH_RADIUS = 6378;

export interface Coordinate {
    latitude: number;
    longitude: number;
}

export function addKMToLatitude(latitude : number, kilometers : number) : number {
    return latitude + (kilometers / EARTH_RADIUS) * (180 / Math.PI);
}

export function addKMToLongitude(latitude : number, longitude : number, kilometers : number) : number {
    return longitude + (kilometers / EARTH_RADIUS) * (180 / Math.PI) / Math.cos(latitude * Math.PI / 180);
}

export function  getKMperDegree() {
    return (2*Math.PI / 360) * EARTH_RADIUS;
}

export function randomCoordinate(coordinate : Coordinate, maxRandomRangeKM : number) : Coordinate {
    const latitude = addKMToLatitude(coordinate.latitude, getRandomValueInRange(maxRandomRangeKM * -1, maxRandomRangeKM));
    const longitude = addKMToLongitude(coordinate.latitude, coordinate.longitude, getRandomValueInRange(maxRandomRangeKM * -1, maxRandomRangeKM));
    return { latitude: latitude, longitude: longitude };
}

function getRandomValueInRange(min: number, max: number) : number {
    return Math.random() * (max - min) + min;
}