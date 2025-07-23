"use client";

import {IndexDBName, IndexHistory, IndexOverview} from "@/utils/types/general.types";
import {HistoryOverviewChart} from "@/app/indices/components/ORIGINAL/HistoryOverviewChart";
import {useEffect, useState} from "react";
import {isEmpty} from "lodash";
import {actionGetIndexHistory} from "@/app/indices/actions";
import {indexDBFactory} from "@/utils/heleprs/indexDBFactory.helper";

export function IndexHistoryOverviewChart({indexOverview}: {indexOverview: IndexOverview}) {
    const [history, setHistory] = useState<IndexHistory[]>([]);

    useEffect(() => {
        (async () => {
            if (!indexOverview) return;

            // get cached Index History
            const {get} = await indexDBFactory(IndexDBName.INDEX_HISTORY);
            setHistory((await get<IndexHistory[]>(indexOverview.id)) ?? []);

            // get cached Index
            const {get: getIndex} = await indexDBFactory(IndexDBName.INDEX_OVERVIEW);
            const cachedIndex = await getIndex(indexOverview.id);

            const doFetch = !cachedIndex || JSON.stringify(indexOverview) !== JSON.stringify(cachedIndex);

            // cache Index
            const {save: saveIndex} = await indexDBFactory(IndexDBName.INDEX_OVERVIEW);
            await saveIndex(indexOverview.id, indexOverview);

            // fetch Index
            if (doFetch) {
                const indexHistory = await actionGetIndexHistory(indexOverview.id, indexOverview);
                setHistory(indexHistory);

                const {save: saveIndexHistory} = await indexDBFactory(IndexDBName.INDEX_HISTORY);
                await saveIndexHistory(indexOverview.id, indexHistory);
            }
        })();
    }, [JSON.stringify(indexOverview)]);

    if (isEmpty(history)) {
        return null;
    }

    return <HistoryOverviewChart history={history} />;
}
