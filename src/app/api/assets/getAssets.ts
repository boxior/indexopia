import axios from "axios";
import {setQueryParams} from "@/utils/heleprs/setQueryParams.helper";
import {ENV_VARIABLES} from "@/env";

export type GetAssetsParameters = {
    search?: string; // DEFAULT: bitcoin; Search by asset id (bitcoin) or symbol (BTC)
    ids?: string; // DEFAULT: bitcoin; ids=bitcoin,ethereum,monero
    limit?: number; // DEFAULT: 5; MAX = 2000
    offset?: number; // DEFAULT: 1; offset
};

export default async function getAssets(params: GetAssetsParameters) {
    try {
        const strUrl = setQueryParams(`${ENV_VARIABLES.COINCAP_API_URL}/assets`, params);

        return await axios
            .get(strUrl, {headers: {authorization: `Bearer ${ENV_VARIABLES.COINCAP_API_KEY}`}})
            .then(res => res.data);
    } catch (error) {
        console.log(error);
        throw error;
    }
}
