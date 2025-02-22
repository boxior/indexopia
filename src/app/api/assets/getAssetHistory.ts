import axios from "axios";
import {setQueryParams} from "@/utils/heleprs/setQueryParams.helper";
import {ENV_VARIABLES} from "@/env";

export type GetAssetHistoryParams = {
    interval: string; // point-in-time interval, e.g. m1, m5, m15, m30, h1, h2, h6, h12, d1
    id: string; // asset id, e.g. asset id
    start?: number; // UNIX time in milliseconds up to 11 years for d1, e.g. 1528470720000
    end?: number; // UNIX time in milliseconds up to 11 years for d1, e.g. 1528470720000
};

export default async function getAssetHistory(params: GetAssetHistoryParams) {
    try {
        const strUrl = setQueryParams(`${ENV_VARIABLES.COINCAP_API_URL}/assets/${params.id}/history`, params);

        return await axios
            .get(strUrl, {headers: {authorization: `Bearer ${ENV_VARIABLES.COINCAP_API_KEY}`}})
            .then(res => res.data);
    } catch (error) {
        console.log(error);
        throw error;
    }
}
