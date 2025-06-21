import {dbDeleteIndexOverview} from "@/lib/db/helpers/db.indexOverview.helpers";
import {Id} from "@/utils/types/general.types";

export const actionDeleteIndexOverview = async (id: Id) => {
    await dbDeleteIndexOverview(id);
};
