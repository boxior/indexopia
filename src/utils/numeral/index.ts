import numeral from "numeral";

const usLocale = {
    delimiters: {
        thousands: ",", // Thousands separator
        decimal: ".", // Decimal separator
    },
    abbreviations: {
        thousand: "k", // Abbreviation for thousand
        million: "m", // Abbreviation for million
        billion: "b", // Abbreviation for billion
        trillion: "t", // Abbreviation for trillion
    },
    ordinal: (number: number) => {
        const b = number % 10;
        return ~~((number % 100) / 10) === 1 ? "th" : b === 1 ? "st" : b === 2 ? "nd" : b === 3 ? "rd" : "th";
    },
    currency: {
        symbol: "$", // Currency symbol for US dollars
    },
};

export enum NumeralFormat {
    INTEGER = "0",
    NUMBER = "0,0.00",
    PERCENT = "0,0.00%",
    CURRENCY_$ = "$0,0.00",
    HUGE = "$0.0a",
}

// Register the locale in numeral
numeral.register("locale", "us", usLocale);

// Use the locale
numeral.locale("us");
numeral.defaultFormat(NumeralFormat.NUMBER);

export default numeral;
