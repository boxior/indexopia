import {SaveSystemIndexProps, SystemIndexBy, SystemIndexSortBy} from "@/utils/types/general.types";
import {capitalize} from "lodash";
import {MAX_ASSETS_COUNT_FOR_SYSTEM_INDICES} from "@/utils/constants/general.constants";

const UP_TO_NUMBERS = [5, 25, 50];
const SORT_BY = Object.values(SystemIndexSortBy);
const BY = Object.values(SystemIndexBy);

const getSystemIndicesProps = () => {
    return UP_TO_NUMBERS.reduce((acc, upToNumber) => {
        const sortByProps = SORT_BY.reduce((ac, sortBy) => {
            const byProps = BY.map(by => {
                return {
                    upToNumber,
                    topAssetsCount: MAX_ASSETS_COUNT_FOR_SYSTEM_INDICES,
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

export const SYSTEM_INDICES_PROPS: SaveSystemIndexProps[] = getSystemIndicesProps();
