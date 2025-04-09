import axios from "axios";
import {setQueryParams} from "@/utils/heleprs/setQueryParams.helper";
import {ENV_VARIABLES} from "@/env";

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

        return await axios.get(strUrl).then(res => res.data);
    } catch (error) {
        console.log(error);
        throw error;
    }
}
