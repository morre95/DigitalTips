import BaseUrl from './BaseUrl';

function prepareHeaders<T>(data: T, token?: string) {
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    if (token) {
        headers.set('Authorization', `Bearer_${token}`);
    } else {
        headers.set('Authorization', 'auth_ThisIsMandatory');
    }
    return {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(data)
    };
}

/*
*
* @example
* interface UserData {
*   name: string;
*   age: number;
* }
*
* interface ResponseData {
*   success: boolean;
*   message: string;
* }
*
* const userData: UserData = { name: "Alice", age: 30 };
*
* const response = await postJson<UserData, ResponseData>('https://api.example.com/user', userData)
* console.log(response);
*
*/
async function postJson<T, TReturn>(url: string, data: T, baseUrl: BaseUrl = BaseUrl.remote): Promise<TReturn> {
    const requestOptions = prepareHeaders(data);
    url = url.startsWith('/') ? `${baseUrl}${url.substring(1)}` : `${baseUrl}${url}`
    return post<TReturn>(url, requestOptions);
}

async function postJsonWithToken<T, TReturn>(url: string, data: T, token: string, baseUrl: BaseUrl = BaseUrl.remote): Promise<TReturn> {
    const requestOptions = prepareHeaders(data, token);
    url = url.startsWith('/') ? `${baseUrl}${url.substring(1)}` : `${baseUrl}${url}`
    return post<TReturn>(url, requestOptions);
}


async function post<TReturn>(url: string, requestOptions: any): Promise<TReturn> {
    try {
        const response = await fetch(url, requestOptions);
        if (!response.ok) {
            throw new Error(`Error message: '${response.headers.get("x-error-message")}' (${response.status})`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error: ', error);
        throw error;
    }
}

async function registerUser<T, TReturn>(data: T): Promise<TReturn> {
    const requestOptions = prepareHeaders(data);
    const url = `${BaseUrl.remote}register`

    try {
        const response = await fetch(url, requestOptions);
        if (response.status === 409) {
            console.error('Username already exists');
            return { message: "Username already exists!", error: true } as TReturn;
        } else if (!response.ok) {
            throw new Error(`This is bad register: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error: `, error);
        throw error;
    }
}

export default postJson;
export { BaseUrl, registerUser, postJsonWithToken};