"use client";

import {Index, AssetWithHistoryOverviewPortionAndMaxDrawDown} from "@/utils/types/general.types";
import {IndexOverview} from "@/app/indices/[id]/components/CLAUD/IndexOverviewComponent";
import {IndexChart} from "@/app/indices/[id]/components/CLAUD/IndexChartComponent";
import {AssetsTable} from "@/app/indices/[id]/components/CLAUD/AssetsTableComponent";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";

interface IndexPageProps {
    index: Index<AssetWithHistoryOverviewPortionAndMaxDrawDown>;
}

export function IndexPageClient({index}: IndexPageProps) {
    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Overview Section */}
            <IndexOverview index={index} />

            {/* Chart and Assets Tabs */}
            <Tabs defaultValue="chart" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="chart">Chart</TabsTrigger>
                    <TabsTrigger value="assets">Assets</TabsTrigger>
                </TabsList>

                <TabsContent value="chart" className="space-y-4">
                    <IndexChart history={index.history} title={`${index.name} Price History`} />
                </TabsContent>

                <TabsContent value="assets" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Assets ({index.assets.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <AssetsTable assets={index.assets} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
