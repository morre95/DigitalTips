import {Coordinate} from '@/interfaces/common'
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



export async function getCity(coordinate: Coordinate): Promise<string | null> {
    const key = process.env["EXPO_PUBLIC_GEOCODE_API_KAY"];
    const url = `https://geocode.maps.co/reverse?lat=${coordinate.latitude}&lon=${coordinate.longitude}&api_key=${key}`

    const result = await fetchJson(url);
    if (!result) {
        return null
    } else if (result.address.town) {
        return result.address.town
    } else if (result.address.municipality) {
        return result.address.municipality
    }

    return null
}