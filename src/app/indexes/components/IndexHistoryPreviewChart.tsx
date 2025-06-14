"use client";

import {IndexHistory, IndexOverview} from "@/utils/types/general.types";
import {HistoryPreviewChart} from "@/app/indexes/components/HistoryPreviewChart";
import {useEffect, useState} from "react";
import {clientApiGetIndexHistory} from "@/utils/clientApi/customIndex.clientApi";
import {isEmpty} from "lodash";

export function IndexHistoryPreviewChart({index}: {index: IndexOverview}) {
    const [history, setHistory] = useState<IndexHistory[]>([]);

    useEffect(() => {
        (async () => {
            index && setHistory((await clientApiGetIndexHistory(index.id, index)).history);
        })();
    }, [JSON.stringify(index)]);

    if (isEmpty(history)) {
        return null;
    }

    return <HistoryPreviewChart history={history} />;
}
