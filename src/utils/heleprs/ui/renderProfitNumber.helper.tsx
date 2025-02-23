import {ReactNode} from "react";

export const renderProfitNumber = (number: number, value: ReactNode) => {
    console.log("number", number);
    if (number < 0) {
        return <span className="text-red-500">{value}</span>;
    }

    if (number > 0) {
        return <span className="text-green-500">{value}</span>;
    }

    return value;
};
