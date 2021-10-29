export async function fetchJsonAsync<T>(responsePromise: Promise<Response>) {
    const responce = await checkFetchErrorAsync(responsePromise);

    return (await responce.json()) as T;
}

export async function fetchStringAsync(responsePromise: Promise<Response>) {
    const responce = await checkFetchErrorAsync(responsePromise);
    return (await responce.text());
}



export async function checkFetchErrorAsync(responsePromise: Promise<Response>) {

    const response = await responsePromise;

    if (!response.ok) {

        console.error("checkFetchError NON OK response");

        if (!response.headers)
            console.error('checkFetchError called with non http response');

        const contentType = response.headers.get('content-type');

        if (contentType && contentType.indexOf('application/json') != -1) {
            const err = await response.json();

            throw new Error(err?.Message||'unknown error');

        }else if(contentType && contentType.indexOf('text/plain') != -1){
            const err = await response.text();

            throw new Error(response.statusText + ' : ' + err);
        }
        else {
            throw new Error(response.statusText );
        }

    }
    else
        return response;
}
