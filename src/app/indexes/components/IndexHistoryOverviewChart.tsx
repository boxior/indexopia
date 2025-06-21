"use client";

import {IndexHistory, IndexOverview} from "@/utils/types/general.types";
import {HistoryOverviewChart} from "@/app/indexes/components/HistoryOverviewChart";
import {useEffect, useState} from "react";
import {isEmpty} from "lodash";
import {handleGetIndexHistory} from "@/app/indexes/actions";

export function IndexHistoryOverviewChart({index}: {index: IndexOverview}) {
    const [history, setHistory] = useState<IndexHistory[]>([]);

    useEffect(() => {
        (async () => {
            index && setHistory(await handleGetIndexHistory(index.id, index));
        })();
    }, [JSON.stringify(index)]);

    if (isEmpty(history)) {
        return null;
    }

    return <HistoryOverviewChart history={history} />;
}
