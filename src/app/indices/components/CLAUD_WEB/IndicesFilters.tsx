"use client";

import {useState} from "react";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Search, X} from "lucide-react";

interface IndicesFiltersProps {
    onSearchChange: (search: string) => void;
    onTypeFilter: (type: string) => void;
    onPerformanceFilter: (performance: string) => void;
    onClearFilters: () => void;
}

export const TOP_PERFORMANCE_COUNT = 5;

export function IndicesFilters({
    onSearchChange,
    onTypeFilter,
    onPerformanceFilter,
    onClearFilters,
}: IndicesFiltersProps) {
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");
    const [performanceFilter, setPerformanceFilter] = useState("all");

    const handleSearchChange = (value: string) => {
        setSearch(value);
        onSearchChange(value);
    };

    const handleTypeChange = (value: string) => {
        setTypeFilter(value);
        onTypeFilter(value);
    };

    const handlePerformanceChange = (value: string) => {
        setPerformanceFilter(value);
        onPerformanceFilter(value);
    };

    const handleClearFilters = () => {
        setSearch("");
        setTypeFilter("all");
        setPerformanceFilter("all");
        onClearFilters();
    };

    const hasActiveFilters = search || typeFilter !== "all" || performanceFilter !== "all";

    return (
        <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                    placeholder="Search indices..."
                    value={search}
                    onChange={e => handleSearchChange(e.target.value)}
                    className="pl-10"
                />
            </div>

            <div className="flex gap-2">
                <Select value={typeFilter} onValueChange={handleTypeChange}>
                    <SelectTrigger className="w-32">
                        <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={performanceFilter} onValueChange={handlePerformanceChange}>
                    <SelectTrigger className="w-40">
                        <SelectValue placeholder="Performance" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Performance</SelectItem>
                        <SelectItem value="positive">Positive 24h</SelectItem>
                        <SelectItem value="negative">Negative 24h</SelectItem>
                        <SelectItem value="top-performers">Top {TOP_PERFORMANCE_COUNT} Performers</SelectItem>
                    </SelectContent>
                </Select>

                {hasActiveFilters && (
                    <Button variant="outline" size="sm" onClick={handleClearFilters} className="px-3">
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </div>
        </div>
    );
}
