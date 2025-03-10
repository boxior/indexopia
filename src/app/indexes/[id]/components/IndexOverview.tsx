import {Index} from "@/utils/types/general.types";
import {renderSafelyNumber} from "@/utils/heleprs/ui/renderSavelyNumber.helper";
import {NumeralFormat} from "@numeral";

export function IndexOverview({index}: {index: Index}) {
    return (
        <div className={"h-full"}>
            <div className={"text-2xl pb-1"}>Overview</div>
            <div className="grid grid-cols-2 gap-1">
                <span className={"font-bold"}>Name:</span>
                <span> {index.name}</span>
                <span className={"font-bold"}>24h:</span>{" "}
                <span>{renderSafelyNumber(index.historyOverview.days1, NumeralFormat.PERCENT)}</span>
                <span className={"font-bold"}>7d:</span>{" "}
                <span>{renderSafelyNumber(index.historyOverview.days7, NumeralFormat.PERCENT)}</span>
                <span className={"font-bold"}>Total:</span>
                <span>{renderSafelyNumber(index.historyOverview.total, NumeralFormat.PERCENT)}</span>
            </div>
        </div>
    );
}
