"use server";

import {dbGetIndexOverviewById} from "@/lib/db/helpers/db.indexOverview.helpers";
import {getAssetsWithHistories, getIndexHistory} from "@/lib/db/helpers/db.helpers";
import {Id, IndexOverview, IndexOverviewAsset} from "@/utils/types/general.types";
import {pick} from "lodash";
import {unstable_cacheTag as cacheTag} from "next/cache";
import {CacheTag} from "@/utils/cache/constants.cache";
import {combineCacheTags} from "@/utils/cache/helpers.cache";
import moment from "moment/moment";
import {HISTORY_OVERVIEW_DAYS} from "@/utils/constants/general.constants";

export const actionGetIndexHistory = async (id: Id, propIndexOverview?: IndexOverview) => {
    "use cache";
    cacheTag(CacheTag.INDICES_OVERVIEW, CacheTag.INDICES_HISTORY, combineCacheTags(CacheTag.INDICES_HISTORY, id));

    const indexOverview = propIndexOverview ?? (await dbGetIndexOverviewById(id));

    if (!indexOverview) {
        return [];
    }

    const {assets: assetsWithHistories} = await getAssetsWithHistories<IndexOverviewAsset>({
        assets: indexOverview.assets,
        startTime: moment().utc().startOf("d").add(-HISTORY_OVERVIEW_DAYS, "days").valueOf(),
    });

    return getIndexHistory({...pick(indexOverview, ["id", "name"]), assets: assetsWithHistories});
};
