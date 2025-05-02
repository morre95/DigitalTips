import {Coordinate} from '@/interfaces/common'
import * as Location from 'expo-location';

const getCityFromAddress = (address: string): string | null => {
    const match = address.match(/\d{3}\s?\d{2}\s([^\d,]+)/);
    if (match) {
        return match[1].trim();
    }
    return null;
}

export async function getCity(coordinate: Coordinate): Promise<string | null> {
    try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            console.error('Location authorization denied');
            return null;
        }

        const result = await Location.reverseGeocodeAsync(coordinate);

        if (result.length > 0) {
            const location = result[0];

            if (location.city === null && location.formattedAddress !== null) {
                return getCityFromAddress(location.formattedAddress);
            }

            return location.city;
        } else {
            console.warn('No location information found');
            return null;
        }
    } catch (error) {
        console.error('Reverse geocoding error:', error);
        return null;
    }
}

export async function getCoordinatesFromAddress(address: string): Promise<Location.LocationGeocodedLocation[] | null> {
    try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            console.error('Location authorization denied');
            return null;
        }
        const result = await Location.geocodeAsync(address);
        if (result.length > 0) {
            return result;
        } else {
            console.warn('No location information found');
            return null;
        }
    } catch (error) {
        console.error('Reverse geocoding error:', error);
        return null;
    }
}