import {Id} from "@/utils/types/general.types";

export const onCloneAction = () => {
    console.log("actionOnClone");
};
export const onEditAction = () => {
    console.log("actionOnEdit");
};
export const onDeleteAction = (id: Id) => {
    console.log("actionOnDelete");
};
export const onCreateNewAction = () => {
    console.log("actionOnCreateNew");
};

export const onCloseAction = () => {
    console.log("onCloseAction");
};

export const onSaveAction = (props: unknown) => {
    console.log("onCloseAction");
};

export const onConfirmDeleteAction = (props: unknown) => {
    console.log("onCloseAction");
};
