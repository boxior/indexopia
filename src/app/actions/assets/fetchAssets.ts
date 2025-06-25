import {setQueryParams} from "@/utils/heleprs/setQueryParams.helper";
import {ENV_VARIABLES} from "@/env";
import {secondsUntilNextMidnightUTC} from "@/utils/heleprs/axios/axios.helpers";

export type FetchAssetsParameters = {
    search?: string; // DEFAULT: bitcoin; Search by asset id (bitcoin) or symbol (BTC)
    ids?: string; // DEFAULT: bitcoin; ids=bitcoin,ethereum,monero
    limit?: number; // DEFAULT: 5; MAX = 2000
    offset?: number; // DEFAULT: 1; offset
};

export default async function fetchAssets(params: FetchAssetsParameters) {
    try {
        const strUrl = setQueryParams(
            `${ENV_VARIABLES.COINCAP_PRO_API_URL}/assets?apiKey=${ENV_VARIABLES.COINCAP_PRO_API_KEY}`,
            params
        );

        // `revalidate` - to avoid fetching too often the limited free API
        return await fetch(strUrl, {next: {revalidate: secondsUntilNextMidnightUTC()}}).then(res => {
            return res.json();
        });
    } catch (error) {
        console.log(error);
        throw error;
    }
}
