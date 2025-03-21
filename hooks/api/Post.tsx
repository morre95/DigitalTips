import BaseUrl from './BaseUrl';

function prepareHeaders<T>(data: T) {
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    headers.set('Authorization', 'auth_ThisIsMandatory');
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
    //console.log(url)

    try {
        const response = await fetch(url, requestOptions);
        if (!response.ok) {
            throw new Error(`Blast! Our posted letter was not received favorably: '${response.statusText}' (${response.status})`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Zounds! Our brave post attempt was met with defeat: `, error);
        throw error;
    }
}

interface IError {
    error: boolean,
    message: string
}

async function registerUser<T, TReturn>(data: T): Promise<TReturn | IError> {
    const requestOptions = prepareHeaders(data);
    const url = `${BaseUrl.remote}register`

    try {
        const response = await fetch(url, requestOptions);
        if (response.status === 409) {
            console.error('Username already exists');
            return new Promise((resolve) => {
                const data: IError = { message: "Username already exists!", error: true };
                resolve(data);
            });
        } else if (!response.ok) {
            throw new Error(`Blast! Our posted letter was not received favorably: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Zounds! Our brave post attempt was met with defeat: `, error);
        throw error;
    }
}

export default postJson;
export { BaseUrl, registerUser};