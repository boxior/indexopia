import {isNil} from "lodash";
import numeral, {NumeralFormat} from "@numeral";

export const renderSafelyNumber = (
    numberStr?: number | string | null,
    format: string | undefined = NumeralFormat.NUMBER
) => {
    try {
        const number = Number(numberStr);
        return isNil(number) || isNaN(number) ? "N/A" : numeral(number).format(format);
    } catch {
        return numberStr;
    }
};
