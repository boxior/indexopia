import {setQueryParams} from "@/utils/heleprs/setQueryParams.helper";
import {ENV_VARIABLES} from "@/env";
import {omit} from "lodash";
import {AssetHistory} from "@/utils/types/general.types";
import {populateMissingAssetHistory} from "@/app/indices/helpers";
import {writeJsonFile} from "@/utils/heleprs/fs.helpers";
import {secondsUntilNextMidnightUTC} from "@/utils/heleprs/axios/axios.helpers";

export type FetchAssetHistoryParams = {
    interval: string; // point-in-time interval, e.g. m1, m5, m15, m30, h1, h2, h6, h12, d1
    id: string; // asset id, e.g. asset id
    start?: number; // UNIX time in milliseconds up to 11 years for d1, e.g. 1528470720000
    end?: number; // UNIX time in milliseconds up to 11 years for d1, e.g. 1528470720000
};

export default async function fetchAssetHistory(
    params: FetchAssetHistoryParams
): Promise<{data: Omit<AssetHistory, "assetId">[]}> {
    try {
        const strUrl = setQueryParams(
            `${ENV_VARIABLES.COINCAP_PRO_API_URL}/assets/${params.id}/history?apiKey=${ENV_VARIABLES.COINCAP_PRO_API_KEY}`,
            omit(params, "id")
        );

        // `revalidate` - to avoid fetching too often the limited free API
        const history = await fetch(strUrl, {next: {revalidate: secondsUntilNextMidnightUTC()}}).then(res =>
            res.json()
        );
        await writeJsonFile("history_" + params.id, history.data, "/db/raw-history");
        const populatedHistory = populateMissingAssetHistory<Omit<AssetHistory, "assetId">>(history.data);
        await writeJsonFile("history_" + params.id, history.data, "/db/populated-history");

        return {
            data: populatedHistory,
        };
    } catch (error) {
        console.log(error);
        throw error;
    }
}
