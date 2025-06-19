import {NextResponse, NextRequest} from "next/server";
import {getAssetsWithHistories, getIndexHistory} from "@/lib/db/helpers/db.helpers";
import {IndexOverviewAsset} from "@/utils/types/general.types";
import {dbGetIndexOverviewById} from "@/lib/db/helpers/db.indexOverview.helpers";
import {pick} from "lodash";

export async function POST(req: NextRequest) {
    try {
        const urlParts = req.nextUrl.pathname.split("/");
        const idIndex = urlParts.indexOf("indexes") + 1;
        const id = urlParts[idIndex];

        const body = await req.json();

        const {indexOverview: propIndexOverview} = body;

        const indexOverview = propIndexOverview ?? (await dbGetIndexOverviewById(id));

        if (!indexOverview) {
            return NextResponse.json(
                {data: JSON.parse(JSON.stringify(new Error("Index overview not found")))},
                {
                    status: 400,
                }
            );
        }

        const {assets: assetsWithHistories} = await getAssetsWithHistories<IndexOverviewAsset>({
            assets: indexOverview.assets,
            startTime: indexOverview.startTime,
        });

        const history = await getIndexHistory({...pick(indexOverview, ["id", "name"]), assets: assetsWithHistories});

        return NextResponse.json(
            {history},
            {
                status: 200,
            }
        );
    } catch (error) {
        console.log(error);
        return NextResponse.json(
            {data: JSON.parse(JSON.stringify(error))},
            {
                status: 400,
            }
        );
    }
}
