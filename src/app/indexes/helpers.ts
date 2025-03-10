export const getChartColorClassname = (value: number) => {
    return value < 0 ? "text-red-500" : "text-green-500";
};

export const getChartColor = (value: number) => {
    return value < 0 ? "#ef4444" : "#22c55e";
};
