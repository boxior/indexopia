import {RecordWithId} from "@/utils/types/general.types";

export type DbItems<Item = RecordWithId> = {
    data: Item[];
};
