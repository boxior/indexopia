import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {Button} from "@/components/ui/button";
import {ChevronLeft, ChevronRight, MoreHorizontal} from "lucide-react";
import {useTranslations} from "next-intl";

interface PaginationProps {
    currentPage: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    onItemsPerPageChange: (itemsPerPage: number) => void;
}

export function IndicesPagination({
    currentPage,
    totalItems,
    itemsPerPage,
    onPageChange,
    onItemsPerPageChange,
}: PaginationProps) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    const t = useTranslations("indices.pagination");

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    };

    const handlePageClick = (page: number) => {
        onPageChange(page);
    };

    const getVisiblePages = (isMobile: boolean = false) => {
        const delta = isMobile ? 1 : 2; // Show fewer pages on mobile
        const start = Math.max(1, currentPage - delta);
        const end = Math.min(totalPages, currentPage + delta);
        const pages = [];

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        return pages;
    };

    if (totalItems === 0) return null;

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-4">
            {/* Results info and items per page - mobile stacked, desktop inline */}
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
                <p className="text-sm text-gray-700 text-center sm:text-left">
                    <span className="hidden sm:inline">{t("showing")} </span>
                    {t("range", {start: startItem, end: endItem, total: totalItems})}
                    <span className="hidden sm:inline"> {t("results")}</span>
                </p>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-700 hidden sm:inline">{t("itemsPerPageLabel")}</span>
                    <span className="text-sm text-gray-700 sm:hidden">{t("itemsPerPageShort")}</span>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                                {itemsPerPage}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            {[20, 50, 100].map(size => (
                                <DropdownMenuItem
                                    key={size}
                                    onClick={() => onItemsPerPageChange(size)}
                                    className={itemsPerPage === size ? "bg-gray-100" : ""}
                                >
                                    {size}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Navigation controls */}
            <div className="flex items-center gap-1 sm:gap-2">
                {/* Previous button */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1"
                >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">{t("previous")}</span>
                </Button>

                {/* Desktop pagination */}
                <div className="hidden sm:flex items-center gap-1">
                    {currentPage > 3 && (
                        <>
                            <Button variant="outline" size="sm" onClick={() => handlePageClick(1)}>
                                1
                            </Button>
                            {currentPage > 4 && <MoreHorizontal className="h-4 w-4 px-1" />}
                        </>
                    )}

                    {getVisiblePages().map(page => (
                        <Button
                            key={page}
                            variant={page === currentPage ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageClick(page)}
                        >
                            {page}
                        </Button>
                    ))}

                    {currentPage < totalPages - 2 && (
                        <>
                            {currentPage < totalPages - 3 && <MoreHorizontal className="h-4 w-4 px-1" />}
                            <Button variant="outline" size="sm" onClick={() => handlePageClick(totalPages)}>
                                {totalPages}
                            </Button>
                        </>
                    )}
                </div>

                {/* Mobile pagination - simplified */}
                <div className="flex sm:hidden items-center gap-1">
                    {/* Show first page if not visible */}
                    {currentPage > 2 && (
                        <>
                            <Button variant="outline" size="sm" onClick={() => handlePageClick(1)}>
                                1
                            </Button>
                            {currentPage > 3 && <MoreHorizontal className="h-4 w-4 px-1" />}
                        </>
                    )}

                    {/* Show current page and adjacent pages */}
                    {getVisiblePages(true).map(page => (
                        <Button
                            key={page}
                            variant={page === currentPage ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageClick(page)}
                            className="min-w-[2.5rem]"
                        >
                            {page}
                        </Button>
                    ))}

                    {/* Show last page if not visible */}
                    {currentPage < totalPages - 1 && (
                        <>
                            {currentPage < totalPages - 2 && <MoreHorizontal className="h-4 w-4 px-1" />}
                            <Button variant="outline" size="sm" onClick={() => handlePageClick(totalPages)}>
                                {totalPages}
                            </Button>
                        </>
                    )}
                </div>

                {/* Page info for mobile */}
                <div className="flex sm:hidden items-center px-2">
                    <span className="text-sm text-gray-600">{t("pageInfo", {current: currentPage, totalPages})}</span>
                </div>

                {/* Next button */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1"
                >
                    <span className="hidden sm:inline">{t("next")}</span>
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
