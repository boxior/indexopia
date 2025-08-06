"use client";
import {IndexDBName, IndexHistory, IndexOverview} from "@/utils/types/general.types";
import {useEffect, useState} from "react";
import {isEmpty, omit} from "lodash";
import {actionGetIndexHistory} from "@/app/indices/actions";
import {indexDBFactory} from "@/utils/heleprs/indexDBFactory.helper";
import {ChartPreview} from "@/app/indices/components/CLAUD_WEB/ChartPreview";
import {HISTORY_OVERVIEW_DAYS} from "@/utils/constants/general.constants";
import ContentLoader from "@/components/Suspense/ContentLoader";

export function IndexHistoryChartPreview({
    indexOverview,
    className,
}: {
    indexOverview: IndexOverview;
    className?: string;
}) {
    const [history, setHistory] = useState<IndexHistory[]>([]);

    useEffect(() => {
        // Defer execution to next tick to avoid blocking UI
        const timeoutId = setTimeout(() => {
            (async () => {
                if (!indexOverview) return;

                // get cached Index History
                const {get} = await indexDBFactory(IndexDBName.INDEX_HISTORY);
                const cachedIndexHistory = (await get<IndexHistory[]>(indexOverview.id)) ?? [];
                setHistory(cachedIndexHistory);

                // get browser cached Index
                const {get: getIndex} = await indexDBFactory(IndexDBName.INDEX_OVERVIEW);
                const cachedIndex = await getIndex<IndexOverview>(indexOverview.id);

                const isFullHistory = cachedIndexHistory?.slice(-1)?.[0]?.time === indexOverview.endTime;

                const hasChangedHistoryRelatedProperties =
                    JSON.stringify(omit(indexOverview, "name")) !== JSON.stringify(omit(cachedIndex, "name"));

                const doFetch = !cachedIndex || hasChangedHistoryRelatedProperties || !isFullHistory;

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
        }, 0);

        return () => clearTimeout(timeoutId);
    }, [JSON.stringify(indexOverview)]);

    if (isEmpty(history)) {
        return <ContentLoader type={"chartPreview"} />;
    }

    return <ChartPreview data={history.slice(-HISTORY_OVERVIEW_DAYS)} className={className} />;
}
