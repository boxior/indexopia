"use client";

import {IndexDBName, IndexHistory, IndexOverview} from "@/utils/types/general.types";
import {HistoryOverviewChart} from "@/app/indexes/components/HistoryOverviewChart";
import {useEffect, useState} from "react";
import {isEmpty} from "lodash";
import {actionGetIndexHistory} from "@/app/indexes/actions";
import {indexDBFactory} from "@/utils/heleprs/indexDBFactory.helper";

export function IndexHistoryOverviewChart({index}: {index: IndexOverview}) {
    const [history, setHistory] = useState<IndexHistory[]>([]);

    useEffect(() => {
        (async () => {
            if (!index) return;

            const {get} = await indexDBFactory(IndexDBName.INDEX_HISTORY);
            setHistory((await get<IndexHistory[]>(index.id)) ?? []);
        })();
    }, []);

    useEffect(() => {
        (async () => {
            if (!index) return;

            const indexHistory = await actionGetIndexHistory(index.id, index);
            setHistory(indexHistory);

            const {save} = await indexDBFactory(IndexDBName.INDEX_HISTORY);
            await save(index.id, indexHistory);
        })();
    }, [JSON.stringify(index)]);

    if (isEmpty(history)) {
        return null;
    }

    return <HistoryOverviewChart history={history} />;
}
