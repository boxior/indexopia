import {IndexOverview as IndexOverviewType, MomentFormat} from "@/utils/types/general.types";
import {renderSafelyNumber} from "@/utils/heleprs/ui/renderSavelyNumber.helper";
import {NumeralFormat} from "@numeral";
import {getIndexDurationLabel, getIndexStartFromLabel} from "@/app/indexes/helpers";
import moment from "moment";

export function IndexOverview({indexOverview}: {indexOverview: IndexOverviewType}) {
    return (
        <div className={"h-full"}>
            <div className={"text-2xl pb-1"}>Overview</div>
            <div className="grid grid-cols-2 gap-1">
                <span className={"font-bold"}>Name:</span>
                <span> {indexOverview.name}</span>
                <span className={"font-bold"}>24h:</span>{" "}
                <span>{renderSafelyNumber(indexOverview.historyOverview.days1, NumeralFormat.PERCENT)}</span>
                <span className={"font-bold"}>7d:</span>{" "}
                <span>{renderSafelyNumber(indexOverview.historyOverview.days7, NumeralFormat.PERCENT)}</span>
                <span className={"font-bold"}>Max DrawDown:</span>
                <span>
                    {renderSafelyNumber(indexOverview.maxDrawDown.value / 100, NumeralFormat.PERCENT)}
                    <span className={"text-xs opacity-50 pl-1"}>
                        ({moment(indexOverview.maxDrawDown.startTime).format(MomentFormat.DATE)} -{" "}
                        {moment(indexOverview.maxDrawDown.endTime).format(MomentFormat.DATE)})
                    </span>
                </span>
                <span className={"font-bold"}>Total:</span>
                <span>{renderSafelyNumber(indexOverview.historyOverview.total, NumeralFormat.PERCENT)}</span>
                <span className={"font-bold"}>Start from:</span>
                <span>{indexOverview.startTime ? getIndexStartFromLabel(indexOverview.startTime) : "N/A"}</span>
                <span className={"font-bold"}>Duration:</span>
                <span>{indexOverview.startTime ? getIndexDurationLabel(indexOverview.startTime) : "N/A"}</span>
            </div>
        </div>
    );
}
