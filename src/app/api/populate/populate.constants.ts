import {SystemIndexBy, SystemIndexSortBy} from "@/utils/types/general.types";
import {capitalize} from "lodash";
import {SaveSystemIndexProps} from "@/utils/heleprs/generators/handleSaveSystemCustomIndex.helper";
import {MAX} from "uuid";
import {MAX_ASSET_COUNT} from "@/utils/constants/general.constants";

const UP_TO_NUMBERS = [5, 25, 50];
const SORT_BY = Object.values(SystemIndexSortBy);
const BY = Object.values(SystemIndexBy);

const getSystemIndexesProps = () => {
    return UP_TO_NUMBERS.reduce((acc, upToNumber) => {
        const sortByProps = SORT_BY.reduce((ac, sort) => {
            const byProps = BY.map(b => {
                return {
                    upToNumber: upToNumber,
                    topAssetsCount: MAX_ASSET_COUNT,
                    equalPortions: false,
                    name: `${capitalize(sort)} ${capitalize(b)} ${upToNumber}`,
                    systemIndexSortBy: SystemIndexSortBy.PROFIT, // profit | maxDrawDown | optimal
                    systemIndexBy: SystemIndexBy.RANK, // rank | extra
                };
            });

            return [...ac, ...byProps];
        }, [] as SaveSystemIndexProps[]);

        return [...acc, ...sortByProps];
    }, [] as SaveSystemIndexProps[]);
};

export const SYSTEM_INDEXES_PROPS: SaveSystemIndexProps[] = getSystemIndexesProps();
