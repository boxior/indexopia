import {Badge} from "@/components/ui/badge";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Index, AssetWithHistoryOverviewPortionAndMaxDrawDown} from "@/utils/types/general.types";
import {getChartColorClassname} from "@/app/indices/helpers";
import {renderSafelyNumber} from "@/utils/heleprs/ui/renderSavelyNumber.helper";
import {NumeralFormat} from "@numeral";

interface IndexOverviewProps {
    index: Index<AssetWithHistoryOverviewPortionAndMaxDrawDown>;
}

export function IndexOverview({index}: IndexOverviewProps) {
    const formatPercentage = (value: number) => {
        const sign = value >= 0 ? "+" : "";
        const color = getChartColorClassname(value);
        return (
            <span className={color}>
                {sign}
                {renderSafelyNumber(value, NumeralFormat.PERCENT)}
            </span>
        );
    };

    const getDurationLabel = () => {
        if (index.startTime && index.endTime) {
            const months = Math.ceil((index.endTime - index.startTime) / (1000 * 60 * 60 * 24 * 30));
            return `${months} months`;
        }
        return "-";
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>{index.name}</span>
                    <Badge variant={index.systemId ? "default" : "secondary"}>
                        {index.systemId ? "System" : "Custom"}
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <p className="text-sm text-muted-foreground">24h</p>
                        <p className="text-2xl font-bold">{formatPercentage(index.historyOverview.days1)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">7d</p>
                        <p className="text-2xl font-bold">{formatPercentage(index.historyOverview.days7)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">30d</p>
                        <p className="text-2xl font-bold">{formatPercentage(index.historyOverview.days30)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Total Return</p>
                        <p className="text-2xl font-bold">{formatPercentage(index.historyOverview.total)}</p>
                    </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-muted-foreground">Max Drawdown</p>
                        <p className="text-lg font-semibold text-red-600">
                            -{Math.abs(index.maxDrawDown.value).toFixed(2)}%
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Duration</p>
                        <p className="text-lg font-semibold text-gray-600">{getDurationLabel()}</p>
                    </div>
                </div>

                <div className="mt-4">
                    <p className="text-sm text-muted-foreground mb-2">Assets ({index.assets.length})</p>
                    <div className="flex flex-wrap gap-2">
                        {index.assets.map((asset, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                                {asset.symbol}
                                <span className="ml-1 text-muted-foreground">
                                    ({(asset.portion * 100).toFixed(1)}%)
                                </span>
                            </Badge>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
