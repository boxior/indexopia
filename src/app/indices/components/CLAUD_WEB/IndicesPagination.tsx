import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {Button} from "@/components/ui/button";

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

    const getVisiblePages = () => {
        const delta = 2;
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
        <div className="flex items-center justify-between px-2 py-4">
            <div className="flex items-center space-x-2">
                <p className="text-sm text-gray-700">
                    Showing {startItem} to {endItem} of {totalItems} results
                </p>
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-700">Items per page:</span>
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

            <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={handlePreviousPage} disabled={currentPage === 1}>
                    Previous
                </Button>

                <div className="flex items-center space-x-1">
                    {currentPage > 3 && (
                        <>
                            <Button variant="outline" size="sm" onClick={() => handlePageClick(1)}>
                                1
                            </Button>
                            {currentPage > 4 && <span className="px-2">...</span>}
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
                            {currentPage < totalPages - 3 && <span className="px-2">...</span>}
                            <Button variant="outline" size="sm" onClick={() => handlePageClick(totalPages)}>
                                {totalPages}
                            </Button>
                        </>
                    )}
                </div>

                <Button variant="outline" size="sm" onClick={handleNextPage} disabled={currentPage === totalPages}>
                    Next
                </Button>
            </div>
        </div>
    );
}
