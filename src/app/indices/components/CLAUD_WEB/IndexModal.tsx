"use client";
import {useState, useEffect} from "react";
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Badge} from "@/components/ui/badge";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Loader2, Plus, X} from "lucide-react";
import {Asset, Id, IndexOverviewAsset, IndexOverviewForCreate} from "@/utils/types/general.types";

export enum IndexMode {
    CREATE = "create",
    EDIT = "edit",
    CLONE = "clone",
}
interface CreateUpdateIndexModalProps {
    isOpen: boolean;
    onCancelAction: () => void;
    onSaveAction: (indexData: ModalIndexData) => Promise<void>;
    availableAssets: Asset[];
    indexOverview?: IndexOverviewForCreate; // Optional prop - if provided, it's used for edit/clone modes
    mode?: IndexMode; // New required prop to determine the context
}
export interface ModalIndexData {
    id?: Id;
    name: string;
    assets: IndexOverviewAsset[];
}
export function IndexModal({
    isOpen,
    onCancelAction,
    onSaveAction,
    availableAssets,
    indexOverview,
    mode = IndexMode.CREATE,
}: CreateUpdateIndexModalProps) {
    const [indexName, setIndexName] = useState("");
    const [selectedAssets, setSelectedAssets] = useState<ModalIndexData["assets"]>([]);
    const [selectedAssetId, setSelectedAssetId] = useState("");

    const [isLoading, setIsLoading] = useState(false);

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
    // Initialize form with existing data when in edit/clone mode
    useEffect(() => {
        if (indexOverview && (mode === IndexMode.EDIT || mode === IndexMode.CLONE)) {
            setIndexName(indexOverview.name);
            setSelectedAssets(indexOverview.assets);
        } else {
            setIndexName("");
            setSelectedAssets([]);
        }
        setSelectedAssetId("");
    }, [indexOverview, isOpen, mode]);

    const handleAddAsset = () => {
        if (!selectedAssetId) return;
        const asset = availableAssets.find(a => a.id === selectedAssetId);
        if (!asset) return;
        const alreadyExists = selectedAssets.some(a => a.id === selectedAssetId);
        if (alreadyExists) return;

        setSelectedAssets([
            ...selectedAssets,
            {
                id: asset.id,
                symbol: asset.symbol,
                name: asset.name,
                rank: asset.rank,
                portion: 0,
            },
        ]);
        setSelectedAssetId("");
    };
    const handleRemoveAsset = (assetId: string) => {
        setSelectedAssets(selectedAssets.filter(a => a.id !== assetId));
    };
    const handlePortionChange = (assetId: string, portion: number) => {
        setSelectedAssets(selectedAssets.map(asset => (asset.id === assetId ? {...asset, portion} : asset)));
    };
    const getTotalPortion = () => {
        return selectedAssets.reduce((sum, asset) => sum + asset.portion, 0);
    };
    const handleSave = async () => {
        if (!indexName.trim()) return;
        if (selectedAssets.length === 0) return;
        if (getTotalPortion() !== 100) return;

        try {
            setIsLoading(true);
            await onSaveAction({
                id: indexOverview?.id,
                name: indexName,
                assets: selectedAssets,
            });
            setIsLoading(false);
            // Reset form
            setIndexName("");
            setSelectedAssets([]);
            setSelectedAssetId("");
            onCancelAction();
        } finally {
            setIsLoading(false);
        }
    };
    const handleClose = () => {
        // Reset to original values or clear form based on mode
        if (indexOverview && (mode === IndexMode.EDIT || mode === IndexMode.CLONE)) {
            setIndexName(indexOverview.name);
            setSelectedAssets(indexOverview.assets);
        } else {
            setIndexName("");
            setSelectedAssets([]);
        }
        setSelectedAssetId("");
        onCancelAction();
    };

    const totalPortion = getTotalPortion();
    const isValid = indexName.trim() && selectedAssets.length > 0 && totalPortion === 100;

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>{labels.title}</DialogTitle>
                    {mode === IndexMode.CLONE && (
                        <p className="text-sm text-gray-600 mt-2">
                            Create a custom copy of this index with your own asset allocation and portfolio composition.
                        </p>
                    )}
                </DialogHeader>
                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="index-name">Index Name</Label>
                        <Input
                            id="index-name"
                            value={indexName}
                            onChange={e => setIndexName(e.target.value)}
                            placeholder={labels.namePlaceholder}
                            disabled={isLoading}
                        />
                    </div>
                    <div className="space-y-4">
                        <Label>Assets & Allocation</Label>
                        <div className="flex gap-2">
                            <Select value={selectedAssetId} onValueChange={setSelectedAssetId} disabled={isLoading}>
                                <SelectTrigger className="flex-1">
                                    <SelectValue placeholder="Select asset to add" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableAssets
                                        .filter(asset => !selectedAssets.some(selected => selected.id === asset.id))
                                        .map(asset => (
                                            <SelectItem key={asset.id} value={asset.id}>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">{asset.symbol}</span>
                                                    <span className="text-sm text-gray-500">{asset.name}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                            <Button onClick={handleAddAsset} disabled={!selectedAssetId || isLoading}>
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {selectedAssets.map(asset => (
                                <div key={asset.id} className="flex items-center gap-2 p-3 border rounded-lg">
                                    <Badge variant="outline">{asset.symbol}</Badge>
                                    <span className="flex-1 text-sm">{asset.name}</span>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="number"
                                            min="0"
                                            max="100"
                                            step="0.01"
                                            value={asset.portion}
                                            onChange={e =>
                                                handlePortionChange(asset.id, parseFloat(e.target.value) || 0)
                                            }
                                            className="w-20"
                                            disabled={isLoading}
                                        />
                                        <span className="text-sm text-gray-500">%</span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleRemoveAsset(asset.id)}
                                        disabled={isLoading}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                        {selectedAssets.length > 0 && (
                            <div className={`flex justify-between items-center p-3 bg-gray-50 rounded-lg`}>
                                <span className="font-medium">Total Allocation:</span>
                                <span
                                    className={`font-medium ${totalPortion === 100 ? "text-green-600" : "text-red-600"}`}
                                >
                                    {totalPortion.toFixed(2)}%
                                </span>
                            </div>
                        )}
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={handleClose} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={!isValid || isLoading}>
                        {isLoading ? (
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
            </DialogContent>
        </Dialog>
    );
}
