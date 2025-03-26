
import BaseUrl from './BaseUrl';

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

    url = url.startsWith('/') ? `${baseUrl}${url.slice(1)}` : `${baseUrl}${url}`

    try {
        const response = await fetch(url, requestOptions);

        if (response.headers.has('X-RateLimit-Remaining')) {
            const timestamp = Number(response.headers.get('X-RateLimit-Reset')) * 1000
            const date = new Date(timestamp)
            console.log('Rate limit remaining', response.headers.get('X-RateLimit-Remaining'), 'it will be restored', date);
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

interface SearchResponse {
    routeId: number;
    name: string;
    city: string;
    date: Date;
    count: number;
    description: string;
    isPrivate: boolean;
    inOrder: boolean;
    owner: number;
}

async function getSearch(keyword: string): Promise<SearchResponse[]|null> {
    interface IResp {
        routes: IRoute[]
        count: number
        error: boolean
    }

    interface IRoute {
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
    }

    const response = await getJson<IResp>(`search/routes/${encodeURIComponent(keyword)}`)

    if (response.error) return null;

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
        }
    ))
}


async function getCheckpoints<T>(id: number): Promise<T> {
    const url = `get/checkpoints/${id}`;
    return await getJson<T>(url);
}

type DeleteType = {
    error: string;
    message: string;
}
async function deleteCheckpoint(id: number, token: string): Promise<DeleteType> {
    const url = `api/delete/checkpoint/${id}`;
    let newToken = `Bearer_${token}`
    return await getJson<DeleteType>(url, {'Content-Type': 'application/json', 'Authorization': newToken});
}

export default getJson;
export { BaseUrl, getRestricted, getSearch, SearchResponse, getCheckpoints, deleteCheckpoint };