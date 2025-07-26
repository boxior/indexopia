import {isNil} from "lodash";
import numeral, {NumeralFormat} from "@numeral";

export const renderSafelyNumber = (number?: number | null, format: string | undefined = NumeralFormat.NUMBER) => {
    return isNil(number) || isNaN(number) ? "N/A" : numeral(number).format(format);
};
