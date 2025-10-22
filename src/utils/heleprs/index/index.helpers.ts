import {
    Asset,
    AssetHistory,
    AssetWithHistoryAndOverview,
    Id,
    IndexHistory,
    IndexOverviewAsset,
    SystemIndexBy,
    SystemIndexSortBy,
} from "@/utils/types/general.types";
import {pick} from "lodash";
import {MAX_ASSETS_COUNT} from "@/utils/constants/general.constants";

export const getIndexOverviewAsset = <A extends IndexOverviewAsset = Asset & {portion: number}>(
    asset: A
): IndexOverviewAsset => {
    return pick(asset, ["id", "name", "symbol", "rank", "portion"]);
};

export const getSystemIndexOverviewId = ({
    systemIndexBy = SystemIndexBy.RANK,
    systemIndexSortBy = SystemIndexSortBy.PROFIT,
    assetsCount = MAX_ASSETS_COUNT,
    equalPortions = false,
}: {
    systemIndexBy?: SystemIndexBy;
    systemIndexSortBy?: SystemIndexSortBy;
    assetsCount?: number;
    equalPortions?: boolean;
}) => {
    return equalPortions ? `equalPortions_${assetsCount}` : `${systemIndexSortBy}_${systemIndexBy}_${assetsCount}`;
};

export const sortIndexAssetsByPortion = (assets: IndexOverviewAsset[]) => {
    return assets.toSorted((a, b) => b.portion - a.portion);
};
export const getIndexHistory = <A extends {id?: Id; portion?: number}>(index: {
    id?: Id;
    name: string;
    assets: AssetWithHistoryAndOverview<A>[];
    startingBalance: number;
}): IndexHistory[] => {
    const portions = index.assets.map(asset => asset.portion ?? 0);

    return mergeAssetHistoriesFromInitial<A>(
        index.assets.map(a => a.history),
        portions,
        index,
        index.startingBalance
    );
};

// another logic, it's probably wrong.
function mergeAssetHistoriesFromInitial<A = Asset>(
    histories: AssetHistory[][],
    portions: number[],
    index: {id?: Id; name: string; assets: AssetWithHistoryAndOverview<A>[]},
    startingBalance: number
): IndexHistory[] {
    if (histories.length === 0 || histories[0].length === 0) {
        return [];
    }

    if (histories.length !== portions.length) {
        throw new Error("The number of histories must match the number of portions");
    }

    // Ensure all portions sum to 100%
    const portionSum = portions.reduce((sum, portion) => sum + portion, 0);
    if (Math.abs(portionSum - 100) > 1e-8) {
        console.error("Portions must sum up to 100%", portionSum, index.id, index.name);

        return [];
    }

    const arrayLength = histories[0].length;

    // Ensure all histories have the same length
    if (!histories.every(history => history.length === arrayLength)) {
        console.error("All histories must have the same length");
        return [];
    }

    const merged: IndexHistory[] = [];

    const initialElements = histories.reduce((acc, el) => {
        return [...acc, el[0]];
    }, [] as AssetHistory[]);

    const getElementsPerformance = (elements: AssetHistory[]) => {
        return elements.reduce((acc, el, i) => {
            const initialElement = initialElements[i];

            // in percent
            const performance =
                ((parseFloat(el.priceUsd) - parseFloat(initialElement.priceUsd)) /
                    parseFloat(initialElement.priceUsd)) *
                100;
            return [...acc, performance];
        }, [] as number[]);
    };

    for (let i = 0; i < arrayLength; i++) {
        const currentElements = histories.map(historyArray => historyArray[i]);
        // Since we assume time and date are the same across arrays, pick them from the first array
        const {time, date} = currentElements[0];

        if (i === 0) {
            merged.push({
                time,
                date,
                priceUsd: startingBalance.toFixed(20),
            });
            continue;
        }

        const initialPrice = parseFloat(merged[0]?.priceUsd) || startingBalance;
        // Compute the weighted average price based on portions
        const weightedAveragePrice = currentElements.reduce((sum, assetHistory, elIndex) => {
            const weight = portions[elIndex] / 100; // Convert portion to a multiplier

            const elementPerformance = getElementsPerformance(currentElements)[elIndex];
            const performance = elementPerformance / 100;

            return sum + initialPrice * performance * weight;
        }, 0);

        merged.push({
            time,
            date,
            priceUsd: (initialPrice + weightedAveragePrice).toFixed(20),
        });
    }

    return merged;
}
