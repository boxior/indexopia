export function setQueryParams(baseURL: string, params: Record<string, string | number | undefined>): string {
    const url = new URL(baseURL);

    // Append only defined parameters to the URL
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            url.searchParams.set(key, String(value));
        }
    });

    return url.toString();
}
