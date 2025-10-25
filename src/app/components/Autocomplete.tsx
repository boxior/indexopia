"use client";
import {useState, useRef, useEffect} from "react";
import {Asset} from "@/utils/types/general.types";
import {Input} from "@/components/ui/input";

// Add this new Autocomplete component before the IndexModal function
interface AutocompleteProps {
    value: string;
    onChange: (value: string) => void;
    onSelect: (value: string) => void;
    placeholder: string;
    disabled?: boolean;
    options: Asset[];
    excludeIds: string[];
}

export function Autocomplete({
    value,
    onChange,
    onSelect,
    placeholder,
    disabled,
    options,
    excludeIds,
}: AutocompleteProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Filter and sort options based on search term
    const filteredOptions = options
        .filter(
            asset =>
                !excludeIds.includes(asset.id) &&
                (asset.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    asset.rank.toString().includes(searchTerm))
        )
        .sort((a, b) => Number(a.rank) - Number(b.rank));

    // Handle input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setSearchTerm(newValue);
        onChange(newValue);
        setIsOpen(true);
    };

    // Handle option selection
    const handleOptionSelect = (assetId: string) => {
        onSelect(assetId);
        setSearchTerm("");
        setIsOpen(false);
        if (inputRef.current) {
            inputRef.current.blur();
        }
    };

    // Handle input focus
    const handleInputFocus = () => {
        setIsOpen(true);
    };

    // Handle input blur with delay to allow option selection
    const handleInputBlur = () => {
        setTimeout(() => setIsOpen(false), 150);
    };

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Escape") {
            setIsOpen(false);
            if (inputRef.current) {
                inputRef.current.blur();
            }
        }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative flex-1" ref={dropdownRef}>
            <Input
                ref={inputRef}
                value={searchTerm}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                disabled={disabled}
                className="flex-1"
                autoComplete="off"
            />

            {isOpen && filteredOptions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {filteredOptions.map(asset => (
                        <div
                            key={asset.id}
                            className="flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => handleOptionSelect(asset.id)}
                        >
                            <span className="text-xs text-gray-400 min-w-[2rem]">#{asset.rank}</span>
                            <span className="font-medium">{asset.symbol}</span>
                            <span className="text-sm text-gray-500">{asset.name}</span>
                        </div>
                    ))}
                </div>
            )}

            {isOpen && filteredOptions.length === 0 && searchTerm && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                    <div className="p-3 text-sm text-gray-500 text-center">No assets found matching "{searchTerm}"</div>
                </div>
            )}
        </div>
    );
}
