import {Coordinate} from '@/interfaces/common'
import * as Location from 'expo-location';

interface Geocode {
    place_id: number
    licence: string
    osm_type: string
    osm_id: number
    lat: string
    lon: string
    display_name: string
    address: Address
    boundingbox: string[]
}

interface Address {
    road: string
    isolated_dwelling: string
    town?: string
    municipality?: string
    county: string
    "ISO3166-2-lvl4": string
    postcode: string
    country: string
    country_code: string
}

async function fetchJson(url: string): Promise<Geocode> {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Something went wrong: ${response.statusText}`);
    }
    return await response.json();
}


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
            console.error('Platsbehörighet nekad');
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