import {isNil} from "lodash";
import numeral from "@numeral";

export const renderSafelyNumber = (number?: number | null, format?: string) => {
    return isNil(number) || isNaN(number) ? "N/A" : numeral(number).format(format);
};
