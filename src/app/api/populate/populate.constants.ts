import {SaveSystemIndexProps, SystemIndexBy, SystemIndexSortBy} from "@/utils/types/general.types";
import {capitalize} from "lodash";
import {MAX} from "uuid";
import {MAX_ASSETS_COUNT} from "@/utils/constants/general.constants";
import {getSystemIndexOverviewId} from "@/utils/heleprs/index/index.helpers";

const UP_TO_NUMBERS = [5, 25, 50];
const SORT_BY = Object.values(SystemIndexSortBy);
const BY = Object.values(SystemIndexBy);

const getSystemIndexesProps = () => {
    return UP_TO_NUMBERS.reduce((acc, upToNumber) => {
        const sortByProps = SORT_BY.reduce((ac, sortBy) => {
            const byProps = BY.map(by => {
                return {
                    upToNumber,
                    topAssetsCount: MAX_ASSETS_COUNT,
                    equalPortions: false,
                    name: `${capitalize(sortBy)} ${capitalize(by)} ${upToNumber}`,
                    systemIndexSortBy: sortBy, // profit | maxDrawDown | optimal
                    systemIndexBy: by, // rank | extra
                };
            });

            return [...ac, ...byProps];
        }, [] as SaveSystemIndexProps[]);

        return [...acc, ...sortByProps];
    }, [] as SaveSystemIndexProps[]);
};

export const SYSTEM_INDEXES_PROPS: SaveSystemIndexProps[] = getSystemIndexesProps();
