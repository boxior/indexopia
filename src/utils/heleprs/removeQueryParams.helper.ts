export function removeQueryParams(fullURL: string, paramsToRemove: string[]): string {
    const url = new URL(fullURL);

    // Remove the specified query parameters
    paramsToRemove.forEach(param => {
        url.searchParams.delete(param);
    });

    return url.toString();
}
