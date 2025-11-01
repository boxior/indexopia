import {isNil} from "lodash";
import numeral, {NumeralFormat} from "@numeral";

export const renderSafelyNumber = (
    numberStr?: number | string | null,
    format: string | undefined = NumeralFormat.NUMBER
) => {
    try {
        const number = Number(numberStr);

        if (isNil(number) || isNaN(number)) {
            return "N/A";
        }

        if (number > 1_000_000) {
            return numeral(number).format(NumeralFormat.HUGE);
        }

        return numeral(number).format(format);
    } catch {
        return numberStr;
    }
};
