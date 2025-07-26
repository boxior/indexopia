"use client";
import {useState} from "react";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Search, X, Plus} from "lucide-react";

interface IndicesFiltersProps {
    onSearchChange: (search: string) => void;
    onTypeFilter: (type: string) => void;
    onPerformanceFilter: (performance: string) => void;
    onClearFilters: () => void;
    onCreateIndex?: () => void;
}

export const TOP_PERFORMANCE_COUNT = 10;
export const POSITIVE_NEGATIVE_DAYS = 7;

export function IndicesFilters({
    onSearchChange,
    onTypeFilter,
    onPerformanceFilter,
    onClearFilters,
    onCreateIndex,
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
        <>
            {/* Mobile Layout (< md) */}
            <div className="flex flex-col gap-3 md:hidden">
                {/* First row: Search input + Create button */}
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search indices..."
                            value={search}
                            onChange={e => handleSearchChange(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    {onCreateIndex && (
                        <Button onClick={onCreateIndex} size="sm" className="flex-shrink-0 h-10 px-3">
                            <Plus className="h-4 w-4 mr-1" />
                            <span className="hidden xs:inline">Create</span>
                        </Button>
                    )}
                </div>

                {/* Second row: Filter selects */}
                <div className="flex gap-2 items-center">
                    <Select value={typeFilter} onValueChange={handleTypeChange}>
                        <SelectTrigger className="flex-1 min-w-0">
                            <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="system">System</SelectItem>
                            <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={performanceFilter} onValueChange={handlePerformanceChange}>
                        <SelectTrigger className="flex-1 min-w-0">
                            <SelectValue placeholder="Performance" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Performance</SelectItem>
                            <SelectItem value="positive">Positive {POSITIVE_NEGATIVE_DAYS}d</SelectItem>
                            <SelectItem value="negative">Negative {POSITIVE_NEGATIVE_DAYS}d</SelectItem>
                            <SelectItem value="top-performers">Top {TOP_PERFORMANCE_COUNT} Performers</SelectItem>
                        </SelectContent>
                    </Select>

                    {hasActiveFilters && (
                        <Button variant="outline" size="sm" onClick={handleClearFilters} className="px-3 flex-shrink-0">
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Tablet+ Layout (md+) - Original Layout */}
            <div className="hidden md:flex flex-col sm:flex-row gap-4 items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search indices..."
                        value={search}
                        onChange={e => handleSearchChange(e.target.value)}
                        className="pl-10"
                    />
                </div>

                <div className="flex gap-2 items-center">
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
                            <SelectItem value="positive">Positive {POSITIVE_NEGATIVE_DAYS}d</SelectItem>
                            <SelectItem value="negative">Negative {POSITIVE_NEGATIVE_DAYS}d</SelectItem>
                            <SelectItem value="top-performers">Top {TOP_PERFORMANCE_COUNT} Performers</SelectItem>
                        </SelectContent>
                    </Select>

                    {hasActiveFilters && (
                        <Button variant="outline" size="sm" onClick={handleClearFilters} className="px-3">
                            <X className="h-4 w-4" />
                        </Button>
                    )}

                    {onCreateIndex && (
                        <Button onClick={onCreateIndex} size="sm" className="ml-2">
                            <Plus className="h-4 w-4 mr-2" />
                            Create Index
                        </Button>
                    )}
                </div>
            </div>
        </>
    );
}
