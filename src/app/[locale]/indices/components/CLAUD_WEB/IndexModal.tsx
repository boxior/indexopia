"use client";
import {Formik, Form, Field, FieldArray} from "formik";
import * as Yup from "yup";
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Badge} from "@/components/ui/badge";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Tooltip, TooltipContent, TooltipTrigger, TooltipProvider} from "@/components/ui/tooltip";
import {Loader2, X} from "lucide-react";
import {Asset, Id, IndexOverviewAsset, IndexOverviewForCreate} from "@/utils/types/general.types";
import {UseIndexActionsReturns} from "@/app/[locale]/indices/[id]/hooks/useIndexActions.hook";
import {useTranslations} from "next-intl";
import {DEFAULT_INDEX_STARTING_BALANCE, INDEX_VALIDATION, MAX_PORTION} from "@/utils/constants/general.constants";

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
    startingBalance: number;
    assets: IndexOverviewAsset[];
}
interface FormValues {
    name: string;
    startingBalance: number;
    assets: IndexOverviewAsset[];
    selectedAssetId: string;
}

export function IndexModal({
    isOpen,
    onCancelAction,
    onSaveAction,
    availableAssets,
    indexOverview,
    mode = IndexMode.CREATE,
}: CreateUpdateIndexModalProps) {
    const tCommon = useTranslations("common");

    const tIndexModal = useTranslations("indexModal");

    const tIndexModalModes = useTranslations("indexModal.modes");
    const tIndexModalFields = useTranslations("indexModal.fields");
    const tIndexModalValidation = useTranslations("indexModal.validation");

    const validationSchema = Yup.object().shape({
        name: Yup.string()
            .trim()
            .required(tIndexModalValidation("name.required"))
            .min(INDEX_VALIDATION.name.min, tIndexModalValidation("name.min", {count: INDEX_VALIDATION.name.min}))
            .max(INDEX_VALIDATION.name.max, tIndexModalValidation("name.max", {count: INDEX_VALIDATION.name.max})),
        startingBalance: Yup.number()
            .required(tIndexModalValidation("startingBalance.required"))
            .min(
                INDEX_VALIDATION.startingBalance.min,
                tIndexModalValidation("startingBalance.min", {count: INDEX_VALIDATION.startingBalance.min})
            )
            .max(
                INDEX_VALIDATION.startingBalance.max,
                tIndexModalValidation("startingBalance.max", {count: INDEX_VALIDATION.startingBalance.max})
            ),
        assets: Yup.array()
            .of(
                Yup.object().shape({
                    id: Yup.string().required(),
                    symbol: Yup.string().required(),
                    name: Yup.string().required(),
                    rank: Yup.number().required(),
                    portion: Yup.number()
                        .min(0, tIndexModalValidation("assets.portion.min", {count: 0}))
                        .max(MAX_PORTION, tIndexModalValidation("assets.portion.max", {count: MAX_PORTION}))
                        .required(tIndexModalValidation("assets.portion.required")),
                })
            )
            .min(1, tIndexModalValidation("assets.atLeastOne"))
            .test(
                "total-allocation",
                tIndexModalValidation("assets.portion.min", {count: MAX_PORTION}),
                function (assets) {
                    if (!assets || assets.length === 0) return true;
                    const total = assets.reduce((sum, asset) => sum + (asset.portion || 0), 0);
                    return Math.abs(total - MAX_PORTION) < 0.01; // Allow for small floating point differences
                }
            ),
    });

    // Get context-aware labels based on mode
    const getLabels = () => {
        switch (mode) {
            case IndexMode.CREATE:
                return {
                    title: tIndexModalModes("create.title"),
                    action: tIndexModalModes("create.action"),
                    namePlaceholder: tIndexModalModes("create.namePlaceholder"),
                    startingBalancePlaceholder: tIndexModalModes("create.startingBalancePlaceholder"),
                };
            case IndexMode.EDIT:
                return {
                    title: tIndexModalModes("edit.title"),
                    action: tIndexModalModes("edit.action"),
                    namePlaceholder: tIndexModalModes("edit.namePlaceholder"),
                    startingBalancePlaceholder: tIndexModalModes("edit.startingBalancePlaceholder"),
                };
            case IndexMode.CLONE:
                return {
                    title: tIndexModalModes("clone.title"),
                    action: tIndexModalModes("clone.action"),
                    namePlaceholder: tIndexModalModes("clone.namePlaceholder"),
                    startingBalancePlaceholder: tIndexModalModes("clone.startingBalancePlaceholder"),
                };
            default:
                return {
                    title: tIndexModalModes("default.title"),
                    action: tIndexModalModes("default.action"),
                    namePlaceholder: tIndexModalModes("default.namePlaceholder"),
                    startingBalancePlaceholder: tIndexModalModes("default.startingBalancePlaceholder"),
                };
        }
    };

    const labels = getLabels();
    const getInitialValues = (): FormValues => {
        if (indexOverview && (mode === IndexMode.EDIT || mode === IndexMode.CLONE)) {
            return {
                name: indexOverview.name,
                startingBalance: indexOverview.startingBalance,
                assets: indexOverview.assets,
                selectedAssetId: "",
            };
        }
        return {
            name: "",
            startingBalance: DEFAULT_INDEX_STARTING_BALANCE,
            assets: [],
            selectedAssetId: "",
        };
    };

    // Function to check if there are changes in edit mode
    const hasChanges = (currentValues: FormValues): boolean => {
        if (mode !== IndexMode.EDIT || !indexOverview) {
            return true; // Always allow submit for non-edit modes
        }

        // Check if name has changed
        if (currentValues.name.trim() !== indexOverview.name.trim()) {
            return true;
        }

        // Check if startingBalance has changed
        if (currentValues.startingBalance !== indexOverview.startingBalance) {
            return true;
        }

        // Check if assets have changed
        if (currentValues.assets.length !== indexOverview.assets.length) {
            return true;
        }

        // Check if any asset details have changed
        const currentAssetsSorted = [...currentValues.assets].sort((a, b) => a.id.localeCompare(b.id));
        const originalAssetsSorted = [...indexOverview.assets].sort((a, b) => a.id.localeCompare(b.id));

        for (let i = 0; i < currentAssetsSorted.length; i++) {
            const current = currentAssetsSorted[i];
            const original = originalAssetsSorted[i];

            if (current.id !== original.id || current.portion !== original.portion) {
                return true;
            }
        }

        return false;
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
                startingBalance: values.startingBalance,
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
                        const formHasChanges = hasChanges(formik.values);
                        const isSubmitDisabled = formik.isSubmitting || (mode === IndexMode.EDIT && !formHasChanges);

                        return (
                            <Form>
                                <DialogHeader>
                                    <DialogTitle>{labels.title}</DialogTitle>
                                    {mode === IndexMode.CLONE && (
                                        <p className="text-sm text-gray-600 mt-2">
                                            {tIndexModalModes("clone.description")}
                                        </p>
                                    )}
                                </DialogHeader>
                                <div className="space-y-6">
                                    {/* Name Input */}
                                    <div className="space-y-2">
                                        <Label htmlFor="name">{tIndexModalFields("name.label")}*</Label>
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
                                    <div className="space-y-2">
                                        <Label htmlFor="startingBalance">
                                            {tIndexModalFields("startingBalance.label")},$*
                                        </Label>
                                        <Field name="startingBalance">
                                            {({field, meta}: any) => (
                                                <>
                                                    <Input
                                                        {...field}
                                                        id="startingBalance"
                                                        type={"number"}
                                                        placeholder={labels.startingBalancePlaceholder}
                                                        disabled={formik.isSubmitting}
                                                        className={meta.touched && meta.error ? "border-red-500" : ""}
                                                        autoComplete="off"
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
                                        <Label>{tIndexModalFields("assetsAllocation.label")}*</Label>
                                        {/* Asset Selector */}
                                        <div className="flex gap-2">
                                            <Field name="selectedAssetId">
                                                {({field}: any) => (
                                                    <Select
                                                        value={field.value}
                                                        onValueChange={value => {
                                                            formik.setFieldValue("selectedAssetId", value);
                                                            // Immediately add the asset when selected
                                                            if (value) {
                                                                const asset = availableAssets.find(a => a.id === value);
                                                                if (
                                                                    asset &&
                                                                    !formik.values.assets.some(a => a.id === value)
                                                                ) {
                                                                    const newAsset: IndexOverviewAsset = {
                                                                        id: asset.id,
                                                                        symbol: asset.symbol,
                                                                        name: asset.name,
                                                                        rank: asset.rank,
                                                                        portion: 0,
                                                                    };
                                                                    formik.setFieldValue("assets", [
                                                                        ...formik.values.assets,
                                                                        newAsset,
                                                                    ]);
                                                                    formik.setFieldValue("selectedAssetId", "");
                                                                }
                                                            }
                                                        }}
                                                        disabled={formik.isSubmitting}
                                                    >
                                                        <SelectTrigger className="flex-1">
                                                            <SelectValue
                                                                placeholder={tIndexModalFields(
                                                                    "assetsAllocation.selectPlaceholder"
                                                                )}
                                                            />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {availableAssets
                                                                .filter(
                                                                    asset =>
                                                                        !formik.values.assets.some(
                                                                            selected => selected.id === asset.id
                                                                        )
                                                                )
                                                                .sort((a, b) => Number(a.rank) - Number(b.rank)) // Sort by rank ascending with type safety
                                                                .map(asset => (
                                                                    <SelectItem key={asset.id} value={asset.id}>
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-xs text-gray-400 min-w-[2rem]">
                                                                                #{asset.rank}
                                                                            </span>
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
                                                            <span className="text-xs text-gray-400 min-w-[2rem]">
                                                                #{asset.rank}
                                                            </span>
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
                                                <span className="font-medium">{tIndexModal("totalAllocation")}:</span>
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
                                <DialogFooter className="flex-col-reverse sm:flex-row gap-2 sm:gap-0">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={onCancelAction}
                                        disabled={formik.isSubmitting}
                                        className="w-full sm:w-auto"
                                    >
                                        {tCommon("cancel")}
                                    </Button>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <span className="w-full sm:w-auto">
                                                    <Button
                                                        type="submit"
                                                        disabled={isSubmitDisabled}
                                                        className="w-full sm:w-auto"
                                                    >
                                                        {formik.isSubmitting ? (
                                                            <>
                                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                <span className="hidden xs:inline">
                                                                    {mode === IndexMode.CREATE
                                                                        ? `${tCommon("creating")}...`
                                                                        : mode === IndexMode.EDIT
                                                                          ? `${tCommon("updating")}...`
                                                                          : `${tCommon("cloning")}...`}
                                                                </span>
                                                                <span className="xs:hidden">
                                                                    {mode === IndexMode.CREATE
                                                                        ? tCommon("creating")
                                                                        : mode === IndexMode.EDIT
                                                                          ? tCommon("updating")
                                                                          : tCommon("cloning")}
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <span className="hidden xs:inline">
                                                                    {labels.action}
                                                                </span>
                                                                <span className="xs:hidden">
                                                                    {mode === IndexMode.CREATE
                                                                        ? tCommon("create")
                                                                        : mode === IndexMode.EDIT
                                                                          ? tCommon("update")
                                                                          : tCommon("clone")}
                                                                </span>
                                                            </>
                                                        )}
                                                    </Button>
                                                </span>
                                            </TooltipTrigger>
                                            {mode === IndexMode.EDIT && !formHasChanges && !formik.isSubmitting && (
                                                <TooltipContent>
                                                    <p>{tCommon("noChangedDetected")}</p>
                                                </TooltipContent>
                                            )}
                                        </Tooltip>
                                    </TooltipProvider>
                                </DialogFooter>
                            </Form>
                        );
                    }}
                </Formik>
            </DialogContent>
        </Dialog>
    );
}
