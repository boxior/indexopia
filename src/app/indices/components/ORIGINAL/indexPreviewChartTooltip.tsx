import {TooltipProps} from "recharts";
import {renderSafelyNumber} from "@/utils/heleprs/ui/renderSavelyNumber.helper";
import {NumeralFormat} from "@numeral";
import {getChartColorClassname} from "@/app/indices/helpers";

export function IndexPreviewChartTooltip(props: TooltipProps<number | string, "date" | "price">) {
    const {payload} = props;

    const {date, price} = payload?.[0]?.payload || {};

    return (
        <div className={"background-foreground p-2 rounded-md shadow-md bg-white"}>
            <div className={"capitalize text-black opacity-50"}>{date}</div>
            <div className={`capitalize ${getChartColorClassname(price)}`}>
                {renderSafelyNumber(price, NumeralFormat.CURRENCY_$)}
            </div>
        </div>
    );
}
