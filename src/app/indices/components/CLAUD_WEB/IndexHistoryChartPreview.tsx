"use client";
import {IndexDBName, IndexHistory, IndexOverview} from "@/utils/types/general.types";
import {useEffect, useState, useRef} from "react";
import {isEmpty, omit} from "lodash";
import {actionGetIndexHistory} from "@/app/indices/actions";
import {indexDBFactory} from "@/utils/heleprs/indexDBFactory.helper";
import {ChartPreview} from "@/app/indices/components/CLAUD_WEB/ChartPreview";
import {HISTORY_OVERVIEW_DAYS} from "@/utils/constants/general.constants";
import ContentLoader from "@/components/Suspense/ContentLoader";
import {globalTaskQueue} from "@/utils/queue/taskQueue";

export function IndexHistoryChartPreview({
    indexOverview,
    className,
}: {
    indexOverview: IndexOverview;
    className?: string;
}) {
    const [history, setHistory] = useState<IndexHistory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const taskIdRef = useRef<string>(`chart-preview-${indexOverview?.id}`);

    useEffect(() => {
        if (!indexOverview) {
            setIsLoading(false);
            return;
        }

        const taskId = taskIdRef.current;

        // Create the async task
        const loadHistoryTask = async () => {
            // get cached Index History
            const {get} = await indexDBFactory(IndexDBName.INDEX_HISTORY);
            const cachedIndexHistory = (await get<IndexHistory[]>(indexOverview.id)) ?? [];

            // Set cached data immediately to show something quickly
            setHistory(cachedIndexHistory);
            if (cachedIndexHistory.length > 0) {
                setIsLoading(false);
            }

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

            // fetch Index if needed
            if (doFetch) {
                const indexHistory = await actionGetIndexHistory(indexOverview.id, indexOverview);
                setHistory(indexHistory);

                const {save: saveIndexHistory} = await indexDBFactory(IndexDBName.INDEX_HISTORY);
                await saveIndexHistory(indexOverview.id, indexHistory);
            }

            setIsLoading(false);
            return history;
        };

        // Add task to queue with priority (visible items get higher priority)
        const priority = isElementVisible() ? 10 : 1;

        globalTaskQueue.addTask(taskId, loadHistoryTask, priority).catch(error => {
            if (error.message !== "Task cancelled") {
                console.error("Chart preview loading failed:", error);
            }
            setIsLoading(false);
        });

        // Cleanup function to cancel the task if component unmounts
        return () => {
            globalTaskQueue.cancelTask(taskId);
        };
    }, [JSON.stringify(indexOverview)]);

    // Helper function to check if element is visible (optional optimization)
    const isElementVisible = () => {
        // You could implement intersection observer here
        // For now, just return true
        return true;
    };

    if (isEmpty(history) && isLoading) {
        return <ContentLoader type={"chartPreview"} />;
    }

    if (isEmpty(history)) {
        return <div className="flex items-center justify-center h-32 text-gray-500">No data available</div>;
    }

    return <ChartPreview data={history.slice(-HISTORY_OVERVIEW_DAYS)} className={className} />;
}
