import {renderSafelyNumber} from "@/utils/heleprs/ui/renderSavelyNumber.helper";
import * as React from "react";

export const renderSafelyPercentage = (value: number) => {
    const sign = value >= 0 ? "+" : "";
    const color = value >= 0 ? "text-green-600" : "text-red-600";
    return (
        <span className={color}>
            {sign}
            {renderSafelyNumber(value)}%
        </span>
    );
};
