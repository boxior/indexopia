"use client";
import {useState, useEffect} from "react";
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Badge} from "@/components/ui/badge";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Plus, X} from "lucide-react";
import {Asset, IndexOverview} from "@/utils/types/general.types";

interface CreateUpdateIndexModalProps {
    isOpen: boolean;
    onCloseAction: () => void;
    onSaveAction: (indexData: CreateIndexData) => void;
    availableAssets: Asset[];
    indexOverview?: IndexOverview; // Optional prop - if provided, it's update mode
}

export interface CreateIndexData {
    name: string;
    assets: {
        id: string;
        symbol: string;
        name: string;
        portion: number;
    }[];
}

export function CreateUpdateIndexModal({
    isOpen,
    onCloseAction,
    onSaveAction,
    availableAssets,
    indexOverview,
}: CreateUpdateIndexModalProps) {
    const [indexName, setIndexName] = useState("");
    const [selectedAssets, setSelectedAssets] = useState<CreateIndexData["assets"]>([]);
    const [selectedAssetId, setSelectedAssetId] = useState("");

    const isUpdateMode = Boolean(indexOverview);

    // Initialize form with existing data when in update mode
    useEffect(() => {
        if (indexOverview) {
            setIndexName(indexOverview.name);
            setSelectedAssets(indexOverview.assets);
        } else {
            setIndexName("");
            setSelectedAssets([]);
        }
        setSelectedAssetId("");
    }, [indexOverview, isOpen]);

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

    const handleSave = () => {
        if (!indexName.trim()) return;
        if (selectedAssets.length === 0) return;
        if (getTotalPortion() !== 100) return;

        onSaveAction({
            name: indexName,
            assets: selectedAssets,
        });

        // Reset form
        setIndexName("");
        setSelectedAssets([]);
        setSelectedAssetId("");
        onCloseAction();
    };

    const handleClose = () => {
        // Reset to original values or clear form
        if (indexOverview) {
            setIndexName(indexOverview.name);
            setSelectedAssets(indexOverview.assets);
        } else {
            setIndexName("");
            setSelectedAssets([]);
        }
        setSelectedAssetId("");
        onCloseAction();
    };

    const totalPortion = getTotalPortion();
    const isValid = indexName.trim() && selectedAssets.length > 0 && totalPortion === 100;

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>{isUpdateMode ? "Update Index" : "Create Custom Index"}</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="index-name">Index Name</Label>
                        <Input
                            id="index-name"
                            value={indexName}
                            onChange={e => setIndexName(e.target.value)}
                            placeholder="Enter index name"
                        />
                    </div>

                    <div className="space-y-4">
                        <Label>Assets & Allocation</Label>

                        <div className="flex gap-2">
                            <Select value={selectedAssetId} onValueChange={setSelectedAssetId}>
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
                            <Button onClick={handleAddAsset} disabled={!selectedAssetId}>
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="space-y-2">
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
                                        />
                                        <span className="text-sm text-gray-500">%</span>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => handleRemoveAsset(asset.id)}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>

                        {selectedAssets.length > 0 && (
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
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
                    <Button variant="outline" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={!isValid}>
                        {isUpdateMode ? "Update Index" : "Create Index"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
