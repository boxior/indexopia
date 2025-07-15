// components/indices/create-index-modal.tsx
"use client";

import {useState, useEffect} from "react";
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Badge} from "@/components/ui/badge";
import {Card, CardContent} from "@/components/ui/card";
import {Separator} from "@/components/ui/separator";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {X, Plus, Search} from "lucide-react";
import {Asset, IndexOverview} from "@/utils/types/general.types";

interface CreateIndexModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    availableAssets: Asset[];
    editingIndex?: IndexOverview | null;
    onSave: (indexData: {name: string; assets: Array<{assetId: string; portion: number}>}) => void;
}

interface SelectedAsset {
    asset: Asset;
    portion: number;
}

export default function CreateIndexModal({
    open,
    onOpenChange,
    availableAssets,
    editingIndex,
    onSave,
}: CreateIndexModalProps) {
    const [indexName, setIndexName] = useState("");
    const [selectedAssets, setSelectedAssets] = useState<SelectedAsset[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [errors, setErrors] = useState<{name?: string; assets?: string; portions?: string}>({});

    useEffect(() => {
        if (editingIndex) {
            setIndexName(editingIndex.name);
            setSelectedAssets(
                editingIndex.assets.map(asset => ({
                    asset: availableAssets.find(a => a.id === asset.id) || {
                        ...asset,
                        supply: "",
                        maxSupply: null,
                        marketCapUsd: "",
                        volumeUsd24Hr: "",
                        priceUsd: "",
                        changePercent24Hr: "",
                        vwap24Hr: null,
                        explorer: null,
                    },
                    portion: asset.portion || 0,
                }))
            );
        } else {
            setIndexName("");
            setSelectedAssets([]);
        }
        setErrors({});
    }, [editingIndex, availableAssets, open]);

    const filteredAssets = availableAssets.filter(
        asset =>
            !selectedAssets.some(selected => selected.asset.id === asset.id) &&
            (asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                asset.symbol.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const addAsset = (asset: Asset) => {
        setSelectedAssets([...selectedAssets, {asset, portion: 0}]);
        setSearchTerm("");
    };

    const removeAsset = (assetId: string) => {
        setSelectedAssets(selectedAssets.filter(item => item.asset.id !== assetId));
    };

    const updatePortion = (assetId: string, portion: number) => {
        setSelectedAssets(selectedAssets.map(item => (item.asset.id === assetId ? {...item, portion} : item)));
    };

    const getTotalPortion = () => {
        return selectedAssets.reduce((sum, item) => sum + item.portion, 0);
    };

    const validateForm = () => {
        const newErrors: {name?: string; assets?: string; portions?: string} = {};

        if (!indexName.trim()) {
            newErrors.name = "Index name is required";
        }

        if (selectedAssets.length === 0) {
            newErrors.assets = "At least one asset must be selected";
        }

        const totalPortion = getTotalPortion();
        if (totalPortion !== 100) {
            newErrors.portions = `Total portions must equal 100% (currently ${totalPortion.toFixed(1)}%)`;
        }

        if (selectedAssets.some(item => item.portion <= 0)) {
            newErrors.portions = "All portions must be greater than 0";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = () => {
        if (!validateForm()) return;

        onSave({
            name: indexName,
            assets: selectedAssets.map(item => ({
                assetId: item.asset.id,
                portion: item.portion,
            })),
        });

        onOpenChange(false);
    };

    const handleAutoBalance = () => {
        if (selectedAssets.length === 0) return;

        const equalPortion = 100 / selectedAssets.length;
        setSelectedAssets(
            selectedAssets.map(item => ({
                ...item,
                portion: Math.round(equalPortion * 100) / 100,
            }))
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{editingIndex ? "Edit Index" : "Create New Index"}</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Index Name */}
                    <div className="space-y-2">
                        <Label htmlFor="indexName">Index Name</Label>
                        <Input
                            id="indexName"
                            value={indexName}
                            onChange={e => setIndexName(e.target.value)}
                            placeholder="Enter index name..."
                            className={errors.name ? "border-red-500" : ""}
                        />
                        {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                    </div>

                    {/* Asset Selection */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label>Select Assets</Label>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleAutoBalance}
                                disabled={selectedAssets.length === 0}
                            >
                                Auto Balance
                            </Button>
                        </div>

                        {/* Search Assets */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search assets..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        {/* Available Assets */}
                        {searchTerm && (
                            <Card className="max-h-32 overflow-y-auto">
                                <CardContent className="p-2">
                                    {filteredAssets.length > 0 ? (
                                        <div className="space-y-1">
                                            {filteredAssets.slice(0, 10).map(asset => (
                                                <div
                                                    key={asset.id}
                                                    className="flex items-center justify-between p-2 rounded hover:bg-gray-50 cursor-pointer"
                                                    onClick={() => addAsset(asset)}
                                                >
                                                    <div className="flex items-center space-x-2">
                                                        <Badge variant="outline">{asset.symbol}</Badge>
                                                        <span className="text-sm">{asset.name}</span>
                                                    </div>
                                                    <Plus className="h-4 w-4 text-gray-400" />
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500 text-center py-2">No assets found</p>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Selected Assets */}
                    {selectedAssets.length > 0 && (
                        <div className="space-y-4">
                            <Label>Selected Assets & Portions</Label>
                            <div className="space-y-2">
                                {selectedAssets.map(item => (
                                    <Card key={item.asset.id}>
                                        <CardContent className="p-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <Badge variant="outline">{item.asset.symbol}</Badge>
                                                    <span className="font-medium">{item.asset.name}</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Input
                                                        type="number"
                                                        value={item.portion}
                                                        onChange={e =>
                                                            updatePortion(
                                                                item.asset.id,
                                                                parseFloat(e.target.value) || 0
                                                            )
                                                        }
                                                        placeholder="0"
                                                        className="w-20 text-right"
                                                        min="0"
                                                        max="100"
                                                        step="0.1"
                                                    />
                                                    <span className="text-sm text-gray-500">%</span>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeAsset(item.asset.id)}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            {/* Total Portion */}
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                <span className="font-medium">Total Portion:</span>
                                <span
                                    className={`font-bold ${getTotalPortion() === 100 ? "text-green-600" : "text-red-600"}`}
                                >
                                    {getTotalPortion().toFixed(1)}%
                                </span>
                            </div>

                            {errors.assets && <p className="text-sm text-red-500">{errors.assets}</p>}
                            {errors.portions && <p className="text-sm text-red-500">{errors.portions}</p>}
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave}>{editingIndex ? "Update Index" : "Create Index"}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
