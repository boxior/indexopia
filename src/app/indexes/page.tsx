import IndexesTable from "@/app/indexes/components/IndexesTable";
import {getIndex} from "@/app/api/assets/db.helpers";
import {IndexId} from "@/utils/types/general.types";

export default async function IndexesPage() {
    const data = await Promise.all(Object.values(IndexId).map(id => getIndex(id)));

    return <IndexesTable data={data} />;
}
