
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
        if (!response.ok) {
            throw new Error('Forsooth, a scourge upon our fetch quest: ' + response.statusText);
        }
        return await response.json();
    } catch (error) {
        console.error(`Zounds! Our valiant attempt was met with defeat: `, error);
        throw error;
    }
}

async function getRestricted<T>(url: string, token: string, baseUrl: BaseUrl = BaseUrl.remote): Promise<T> {
    let newToken = `Bearer_${token}`
    return await getJson<T>(url, {'Content-Type': 'application/json', 'Authorization': newToken}, baseUrl);
}

export default getJson;
export { BaseUrl, getRestricted };