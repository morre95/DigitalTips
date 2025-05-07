import { fetch } from 'expo/fetch';
import BaseUrl from './BaseUrl';
import {getPlayerId} from "@/functions/common";

async function getJson<T>(url: string, headers: any = null, baseUrl: BaseUrl = BaseUrl.remote): Promise<T> {
    if (!headers) {
        headers = new Headers();
        headers.set('Content-Type', 'application/json');
        headers.set('Authorization', 'auth_ThisIsMandatory');
    }
    const requestOptions = {
        method: 'GET',
        headers: headers
    };

    url = url.startsWith('/') ? `${baseUrl}${url.slice(1)}` : `${baseUrl}${url}`;

    try {
        const response = await fetch(url, requestOptions);
        if (response.headers.has('X-RateLimit-Remaining')) {
            const timestamp = Number(response.headers.get('X-RateLimit-Reset')) * 1000
            const date = new Date(timestamp);
            const remaining = Number(response.headers.get('X-RateLimit-Remaining'));
            if (remaining <= 0) {
                console.error('Remaining:', remaining, 'It will be restored', date);
            }
        }

        if (!response.ok) {
            throw new Error('Forsooth, a scourge upon our fetch quest: ' + response.statusText);
        }

        return await response.json();
    } catch (error) {
        console.error(`Zounds! Our valiant attempt was met with defeat: `, error);
        throw error;
    }
}

// TODO: fixa så att den hämtar hem en ny token när den har gått ut.
// TBD: Logga in och hämta token i getRestricted() istället eller kör registerOrLogin() så man inte behöver gör det i komponenterna
async function getRestricted<T>(url: string, token: string, baseUrl: BaseUrl = BaseUrl.remote): Promise<T> {
    let newToken = `Bearer_${token}`
    return await getJson<T>(url, {'Content-Type': 'application/json', 'Authorization': newToken}, baseUrl);
}

export interface SearchResponse {
    routeId: number;
    name: string;
    city: string;
    date: Date;
    count: number;
    description: string;
    isPrivate: boolean;
    inOrder: boolean;
    owner: number;
    playerHaseFinishedThis: boolean;
    startAt?: Date;
    endAt?: Date;
}

export interface IRestrictedRoute {
    route_id: number;
    name: string;
    description: string;
    created_at: Date;
    updated_at: Date;
    city: string;
    marker_count: number;
    is_private: boolean;
    in_order: boolean;
    owner: number;
    playerHaseFinishedThis: boolean;
    start_at?: Date;
    end_at?: Date;
}

export interface ISearchResultResp {
    routes: IRestrictedRoute[];
    count: number;
    error: boolean;
}

async function getSearch(keyword: string, token: string): Promise<SearchResponse[]|null> {
    const userId = await getPlayerId();
    const response = await getRestricted<ISearchResultResp>(`api/search/routes/${encodeURIComponent(keyword)}/${userId}`, token);
    if (response.error) return null;

    return mapSearchResult(response);
}

function mapSearchResult(response: ISearchResultResp): SearchResponse[] {
    return response.routes.map(r => (
        {
            count: r.marker_count,
            name: r.name,
            description: r.description,
            routeId: r.route_id,
            city: r.city,
            date: (r.created_at < r.updated_at) ? r.updated_at : r.created_at,
            isPrivate: r.is_private,
            inOrder: r.in_order,
            owner: Number(r.owner),
            startAt: r.start_at,
            endAt: r.end_at,
            playerHaseFinishedThis: r.playerHaseFinishedThis,
        }
    ));
}


async function getCheckpoints<T>(routeId: number, token: string): Promise<T> {
    const url = `api/get/checkpoints/${routeId}`;
    return await getRestricted<T>(url, token);
}

export type RouteInfo = {
    routeId: number;
    owner: number;
    name: string;
    city: string
    description: string;
    isPrivate: boolean;
    inOrder: boolean;
    startAt: Date | null;
    endAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
async function getRoute(id: number, token: string) {
    const url = `api/get/route/info/${id}`;
    let newToken = `Bearer_${token}`
    return await getJson<RouteInfo>(url, {'Content-Type': 'application/json', 'Authorization': newToken});
}

export type DeleteType = {
    error: string;
    message: string;
}
async function deleteCheckpoint(id: number, token: string): Promise<DeleteType> {
    const url = `api/delete/checkpoint/${id}`;
    let newToken = `Bearer_${token}`
    return await getJson<DeleteType>(url, {'Content-Type': 'application/json', 'Authorization': newToken});
}

async function pingServer<T>() {
    const url = 'ping';
    return await getJson<T>(url);
}

async function getMyRoutes(appId: number, token: string): Promise<SearchResponse[]|null> {
    const response = await getRestricted<ISearchResultResp>(`api/get/my/routes/${encodeURIComponent(appId)}`, token);

    if (response.error) return null;

    return mapSearchResult(response);
}

export type Result = {
    name: string;
    resultId: number;
    routeId: number;
    userId: number;
    correct: number;
    incorrect: number;
    notAnswered: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface IResultResp {
    error: string;
    message: string;
    results: Result[];
}

async function getMyResults(userId: number, token: string): Promise<Result[]|null> {
    const response = await getRestricted<IResultResp>(`api/get/my/results/${encodeURIComponent(userId)}`, token);
    if (response.error) return null;
    return response.results;
}

export default getJson;
export { BaseUrl, getRestricted, getSearch, getCheckpoints, deleteCheckpoint, getRoute, pingServer, getMyRoutes, getMyResults };