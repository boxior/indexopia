"use client";
import {Formik, Form, Field, FieldArray, FormikProps} from "formik";
import * as Yup from "yup";
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Badge} from "@/components/ui/badge";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Loader2, Plus, X} from "lucide-react";
import {Asset, Id, IndexOverviewAsset, IndexOverviewForCreate} from "@/utils/types/general.types";
import {UseIndexActionsReturns} from "@/app/indices/[id]/hooks/useIndexActions.hook";

export enum IndexMode {
    CREATE = "create",
    EDIT = "edit",
    CLONE = "clone",
}

interface CreateUpdateIndexModalProps {
    isOpen: boolean;
    onCancelAction: () => void;
    onSaveAction: UseIndexActionsReturns["onSave"];
    availableAssets: Asset[];
    indexOverview?: IndexOverviewForCreate;
    mode?: IndexMode;
}

export interface ModalIndexData {
    id?: Id;
    name: string;
    assets: IndexOverviewAsset[];
}

interface FormValues {
    name: string;
    assets: IndexOverviewAsset[];
    selectedAssetId: string;
}

const validationSchema = Yup.object().shape({
    name: Yup.string()
        .trim()
        .required("Index name is required")
        .min(2, "Index name must be at least 2 characters")
        .max(100, "Index name must be less than 100 characters"),
    assets: Yup.array()
        .of(
            Yup.object().shape({
                id: Yup.string().required(),
                symbol: Yup.string().required(),
                name: Yup.string().required(),
                rank: Yup.number().required(),
                portion: Yup.number()
                    .min(0, "Portion must be at least 0%")
                    .max(100, "Portion cannot exceed 100%")
                    .required("Portion is required"),
            })
        )
        .min(1, "At least one asset is required")
        .test("total-allocation", "Total allocation must equal 100%", function (assets) {
            if (!assets || assets.length === 0) return true;
            const total = assets.reduce((sum, asset) => sum + (asset.portion || 0), 0);
            return Math.abs(total - 100) < 0.01; // Allow for small floating point differences
        }),
});

export function IndexModal({
    isOpen,
    onCancelAction,
    onSaveAction,
    availableAssets,
    indexOverview,
    mode = IndexMode.CREATE,
}: CreateUpdateIndexModalProps) {
    // Get context-aware labels based on mode
    const getLabels = () => {
        switch (mode) {
            case IndexMode.CREATE:
                return {
                    title: "Create Custom Index",
                    action: "Create Index",
                    namePlaceholder: "Enter index name",
                };
            case IndexMode.EDIT:
                return {
                    title: "Edit Index",
                    action: "Update Index",
                    namePlaceholder: "Enter index name",
                };
            case IndexMode.CLONE:
                return {
                    title: "Clone Index",
                    action: "Clone Index",
                    namePlaceholder: "Enter new index name",
                };
            default:
                return {
                    title: "Index",
                    action: "Save",
                    namePlaceholder: "Enter index name",
                };
        }
    };

    const labels = getLabels();

    const getInitialValues = (): FormValues => {
        if (indexOverview && (mode === IndexMode.EDIT || mode === IndexMode.CLONE)) {
            return {
                name: indexOverview.name,
                assets: indexOverview.assets,
                selectedAssetId: "",
            };
        }
        return {
            name: "",
            assets: [],
            selectedAssetId: "",
        };
    };

    const handleAddAsset = (values: FormValues, setFieldValue: (field: string, value: any) => void) => {
        if (!values.selectedAssetId) return;

        const asset = availableAssets.find(a => a.id === values.selectedAssetId);
        if (!asset) return;

        const alreadyExists = values.assets.some(a => a.id === values.selectedAssetId);
        if (alreadyExists) return;

        const newAsset: IndexOverviewAsset = {
            id: asset.id,
            symbol: asset.symbol,
            name: asset.name,
            rank: asset.rank,
            portion: 0,
        };

        setFieldValue("assets", [...values.assets, newAsset]);
        setFieldValue("selectedAssetId", "");
    };

    const handleRemoveAsset = (
        assetId: string,
        values: FormValues,
        setFieldValue: (field: string, value: any) => void
    ) => {
        const updatedAssets = values.assets.filter(a => a.id !== assetId);
        setFieldValue("assets", updatedAssets);
    };

    const getTotalPortion = (assets: IndexOverviewAsset[]) => {
        return assets.reduce((sum, asset) => sum + (asset.portion || 0), 0);
    };

    const handleSubmit = async (
        values: FormValues,
        {setSubmitting}: {setSubmitting: (isSubmitting: boolean) => void}
    ) => {
        try {
            await onSaveAction({
                id: indexOverview?.id,
                name: values.name,
                assets: values.assets,
            });
            onCancelAction();
        } catch (error) {
            console.error("Error saving index:", error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onCancelAction}>
            <DialogContent className="sm:max-w-[600px]">
                <Formik
                    initialValues={getInitialValues()}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                    enableReinitialize
                >
                    {formik => {
                        const totalPortion = getTotalPortion(formik.values.assets);

                        return (
                            <Form>
                                <DialogHeader>
                                    <DialogTitle>{labels.title}</DialogTitle>
                                    {mode === IndexMode.CLONE && (
                                        <p className="text-sm text-gray-600 mt-2">
                                            Create a custom copy of this index with your own asset allocation and
                                            portfolio composition.
                                        </p>
                                    )}
                                </DialogHeader>

                                <div className="space-y-6">
                                    {/* Name Input */}
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Index Name*</Label>
                                        <Field name="name">
                                            {({field, meta}: any) => (
                                                <>
                                                    <Input
                                                        {...field}
                                                        id="name"
                                                        placeholder={labels.namePlaceholder}
                                                        disabled={formik.isSubmitting}
                                                        className={meta.touched && meta.error ? "border-red-500" : ""}
                                                    />
                                                    {meta.touched && meta.error && (
                                                        <p className="text-sm text-red-500">{meta.error}</p>
                                                    )}
                                                </>
                                            )}
                                        </Field>
                                    </div>

                                    {/* Assets & Allocation */}
                                    <div className="space-y-4">
                                        <Label>Assets & Allocation*</Label>

                                        {/* Asset Selector */}
                                        <div className="flex gap-2">
                                            <Field name="selectedAssetId">
                                                {({field}: any) => (
                                                    <Select
                                                        value={field.value}
                                                        onValueChange={value =>
                                                            formik.setFieldValue("selectedAssetId", value)
                                                        }
                                                        disabled={formik.isSubmitting}
                                                    >
                                                        <SelectTrigger className="flex-1">
                                                            <SelectValue placeholder="Select asset to add" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {availableAssets
                                                                .filter(
                                                                    asset =>
                                                                        !formik.values.assets.some(
                                                                            selected => selected.id === asset.id
                                                                        )
                                                                )
                                                                .map(asset => (
                                                                    <SelectItem key={asset.id} value={asset.id}>
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="font-medium">
                                                                                {asset.symbol}
                                                                            </span>
                                                                            <span className="text-sm text-gray-500">
                                                                                {asset.name}
                                                                            </span>
                                                                        </div>
                                                                    </SelectItem>
                                                                ))}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            </Field>
                                            <Button
                                                type="button"
                                                onClick={() => handleAddAsset(formik.values, formik.setFieldValue)}
                                                disabled={!formik.values.selectedAssetId || formik.isSubmitting}
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>

                                        {/* Selected Assets */}
                                        <FieldArray name="assets">
                                            {() => (
                                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                                    {formik.values.assets.map((asset, index) => (
                                                        <div
                                                            key={asset.id}
                                                            className="flex items-center gap-2 p-3 border rounded-lg"
                                                        >
                                                            <Badge variant="outline">{asset.symbol}</Badge>
                                                            <span className="flex-1 text-sm">{asset.name}</span>
                                                            <div className="flex items-center gap-2">
                                                                <Field name={`assets.${index}.portion`}>
                                                                    {({field, meta}: any) => (
                                                                        <>
                                                                            <Input
                                                                                {...field}
                                                                                type="number"
                                                                                min="0"
                                                                                max="100"
                                                                                step="1"
                                                                                className={`w-20 ${meta.touched && meta.error ? "border-red-500" : ""}`}
                                                                                disabled={formik.isSubmitting}
                                                                                onChange={e => {
                                                                                    const value =
                                                                                        parseFloat(e.target.value) || 0;
                                                                                    formik.setFieldValue(
                                                                                        `assets.${index}.portion`,
                                                                                        value
                                                                                    );
                                                                                }}
                                                                            />
                                                                        </>
                                                                    )}
                                                                </Field>
                                                                <span className="text-sm text-gray-500">%</span>
                                                            </div>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() =>
                                                                    handleRemoveAsset(
                                                                        asset.id,
                                                                        formik.values,
                                                                        formik.setFieldValue
                                                                    )
                                                                }
                                                                disabled={formik.isSubmitting}
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </FieldArray>

                                        {/* Total Allocation Display */}
                                        {formik.values.assets.length > 0 && (
                                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                                <span className="font-medium">Total Allocation:</span>
                                                <span
                                                    className={`font-medium ${
                                                        Math.abs(totalPortion - 100) < 0.01
                                                            ? "text-green-600"
                                                            : "text-red-600"
                                                    }`}
                                                >
                                                    {totalPortion.toFixed(2)}%
                                                </span>
                                            </div>
                                        )}

                                        {/* Assets Validation Error */}
                                        {formik.touched.assets &&
                                            formik.errors.assets &&
                                            typeof formik.errors.assets === "string" && (
                                                <p className="text-sm text-red-500">{formik.errors.assets}</p>
                                            )}
                                    </div>
                                </div>

                                <DialogFooter>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={onCancelAction}
                                        disabled={formik.isSubmitting}
                                    >
                                        Cancel
                                    </Button>

                                    <Button type="submit">
                                        {formik.isSubmitting ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                {mode === IndexMode.CREATE
                                                    ? "Creating..."
                                                    : mode === IndexMode.EDIT
                                                      ? "Updating..."
                                                      : "Cloning..."}
                                            </>
                                        ) : (
                                            labels.action
                                        )}
                                    </Button>
                                </DialogFooter>
                            </Form>
                        );
                    }}
                </Formik>
            </DialogContent>
        </Dialog>
    );
}
