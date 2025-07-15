"use client";

import {useState} from "react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {X, Plus, Search} from "lucide-react";
import {createIndex, updateIndex} from "@/app/indices/components/IDEA/actions";

interface IndexFormProps {
    initialData?: any;
    onSuccess: () => void;
}

interface Stock {
    id: string;
    symbol: string;
    name: string;
    weight: number;
}

export function IndexForm({initialData, onSuccess}: IndexFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: initialData?.name || "",
        description: initialData?.description || "",
        category: initialData?.category || "",
        status: initialData?.status || "draft",
    });
    const [stocks, setStocks] = useState<Stock[]>(initialData?.stocks || []);
    const [stockSearch, setStockSearch] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (initialData) {
                await updateIndex(initialData.id, {...formData, stocks});
            } else {
                await createIndex({...formData, stocks});
            }
            onSuccess();
        } catch (error) {
            console.error("Error saving index:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const addStock = (stock: {symbol: string; name: string}) => {
        if (!stocks.find(s => s.symbol === stock.symbol)) {
            setStocks(prev => [
                ...prev,
                {
                    id: Date.now().toString(),
                    symbol: stock.symbol,
                    name: stock.name,
                    weight: 0,
                },
            ]);
        }
        setStockSearch("");
    };

    const removeStock = (stockId: string) => {
        setStocks(prev => prev.filter(s => s.id !== stockId));
    };

    const updateStockWeight = (stockId: string, weight: number) => {
        setStocks(prev => prev.map(s => (s.id === stockId ? {...s, weight} : s)));
    };

    const totalWeight = stocks.reduce((sum, stock) => sum + stock.weight, 0);

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Index Name</Label>
                    <Input
                        id="name"
                        value={formData.name}
                        onChange={e => setFormData(prev => ({...prev, name: e.target.value}))}
                        placeholder="Enter index name"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                        value={formData.category}
                        onValueChange={value => setFormData(prev => ({...prev, category: value}))}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="technology">Technology</SelectItem>
                            <SelectItem value="healthcare">Healthcare</SelectItem>
                            <SelectItem value="finance">Finance</SelectItem>
                            <SelectItem value="energy">Energy</SelectItem>
                            <SelectItem value="consumer">Consumer</SelectItem>
                            <SelectItem value="industrial">Industrial</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    value={formData.description}
                    onChange={e => setFormData(prev => ({...prev, description: e.target.value}))}
                    placeholder="Describe your index strategy..."
                    rows={3}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                    value={formData.status}
                    onValueChange={value => setFormData(prev => ({...prev, status: value}))}
                >
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        Stocks Composition
                        <Badge variant={totalWeight === 100 ? "default" : "secondary"}>
                            Total Weight: {totalWeight}%
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search stocks..."
                                value={stockSearch}
                                onChange={e => setStockSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => addStock({symbol: stockSearch.toUpperCase(), name: stockSearch})}
                            disabled={!stockSearch}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add
                        </Button>
                    </div>

                    {stocks.length > 0 && (
                        <div className="space-y-2">
                            {stocks.map(stock => (
                                <div key={stock.id} className="flex items-center gap-2 p-2 border rounded-lg">
                                    <div className="flex-1">
                                        <div className="font-medium">{stock.symbol}</div>
                                        <div className="text-sm text-gray-500">{stock.name}</div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="number"
                                            value={stock.weight}
                                            onChange={e => updateStockWeight(stock.id, Number(e.target.value))}
                                            placeholder="Weight %"
                                            className="w-20"
                                            min="0"
                                            max="100"
                                        />
                                        <span className="text-sm text-gray-500">%</span>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeStock(stock.id)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={onSuccess}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isLoading || totalWeight !== 100}>
                    {isLoading ? "Saving..." : initialData ? "Update Index" : "Create Index"}
                </Button>
            </div>
        </form>
    );
}
