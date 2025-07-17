import {ServerPageProps} from "@/utils/types/general.types";
import {IndexChart} from "@/app/indices/[id]/components/IndexChart";
import {IndexAssetsTable} from "@/app/indices/[id]/components/IndexAssetsTable";
import {getIndex} from "@/lib/db/helpers/db.helpers";
import {Card} from "@/components/ui/card";
import {IndexOverview} from "@/app/indices/[id]/components/IndexOverview";
import * as React from "react";
import {UpdateIndex} from "@/app/indices/components/Index/UpdateIndex";
import {connection} from "next/server";
import SuspenseWrapper from "@/components/Suspense/SuspenseWrapper";
import ContentLoader from "@/components/Suspense/ContentLoader";

export default async function IndexPage(props: ServerPageProps) {
    return (
        <SuspenseWrapper
            loadingMessage="Loading index details..."
            variant="pulse"
            showLogo={false}
            fullScreen={false}
            fallback={
                <div className="container mx-auto px-4 py-8 space-y-8">
                    <ContentLoader type="card" count={1} />
                    <ContentLoader type="chart" count={1} />
                    <ContentLoader type="table" count={3} />
                </div>
            }
        >
            <IndexPageComponent {...props} />
        </SuspenseWrapper>
    );
}

const IndexPageComponent = async (props: ServerPageProps) => {
    await connection();

    const params = await props.params;

    const index = await getIndex({
        id: params.id,
    });

    if (!index) {
        return <div>Index not found</div>;
    }

    const doUpdate = index && !index.systemId;

    return (
        <div className={"flex flex-col gap-4"}>
            {doUpdate && <UpdateIndex indexOverview={index} />}
            <div className="flex gap-4">
                <Card className={"flex-1 p-2"}>
                    <IndexOverview indexOverview={index} />
                </Card>
                <Card className="size-2/4 ">
                    <IndexChart index={index} />
                </Card>
            </div>

            <IndexAssetsTable index={index} />
        </div>
    );
};
