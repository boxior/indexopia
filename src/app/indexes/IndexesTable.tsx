"use client";

import * as React from "react";
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import {ArrowDown, ArrowUp, ChevronDown} from "lucide-react";

import {Button} from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {Input} from "@/components/ui/input";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Asset, Index, MomentFormat} from "@/utils/types/general.types";
import {NumeralFormat} from "@numeral";
import {renderSafelyNumber} from "@/utils/heleprs/ui/renderSavelyNumber.helper";
import moment from "moment";
import {ReactNode} from "react";
import {IndexPreviewAreaChart} from "@/app/indexes/IndexPreviewAreaChart";

export default function IndexesTable({data}: {data: Index[]}) {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});

    const renderColumnSortedHeader =
        (header: ReactNode): ColumnDef<Index>["header"] =>
        ({column}) => {
            const sorted = column.getIsSorted();

            return (
                <Button
                    className={"p-0"}
                    variant="ghost"
                    onClick={() => {
                        // Toggle sorting between asc, desc, and false
                        if (sorted === "asc")
                            column.toggleSorting(true); // Set to desc
                        else if (sorted === "desc")
                            column.clearSorting(); // Reset to unsorted
                        else column.toggleSorting(false); // Set to asc
                    }}
                >
                    {header} {sorted === false ? null : sorted === "asc" ? <ArrowUp /> : <ArrowDown />}
                </Button>
            );
        };

    const columns: ColumnDef<Index>[] = [
        {
            accessorKey: "rank",
            header: "#",
            cell: ({row}) => <div className="capitalize">{row.index + 1}</div>,
        },
        {
            accessorKey: "name",
            cell: ({row}) => <div className="capitalize">{row.getValue("name")}</div>,
            header: renderColumnSortedHeader("Index"),
            sortingFn: (rowA, rowB) => {
                /** Extract the numeric value from the "Index" string */
                const rankA = parseInt(rowA.original.name.replace("Index ", ""));
                const rankB = parseInt(rowB.original.name.replace("Index ", ""));
                /** Perform a numerical comparison */
                return rankA - rankB;
            },
            meta: {
                text: "Index",
            },
        },
        {
            accessorKey: "assets",
            header: "Assets",
            cell: ({row}) => (
                <div className="capitalize">
                    {(row.getValue("assets") as Asset[]).map(asset => asset.name).join(", ")}
                </div>
            ),
        },
        {
            id: "historyOverview_24h",
            accessorFn: row => row.historyOverview?.days1, // Ensure this resolves correctly
            cell: ({row}) => {
                const value = row.getValue("historyOverview_24h") as number;
                return (
                    <div className={`lowercase ${value < 0 ? "text-red-500" : "text-green-500"}`}>
                        {renderSafelyNumber(value, NumeralFormat.PERCENT)}
                    </div>
                ); // Safely handle null/undefined
            },
            header: renderColumnSortedHeader("24h %"),
            meta: {
                text: "24h %",
            },
        },
        {
            id: "historyOverview_7d",
            accessorFn: row => row.historyOverview?.days7, // Access only the needed value
            cell: ({row}) => {
                const value = row.getValue("historyOverview_7d") as number;
                return (
                    <div className={`lowercase ${value < 0 ? "text-red-500" : "text-green-500"}`}>
                        {renderSafelyNumber(value, NumeralFormat.PERCENT)}
                    </div>
                ); // Safely render the value
            },
            header: renderColumnSortedHeader("7d %"),
            meta: {
                text: "7d %",
            },
        },
        {
            id: "historyOverview_7d_chart",
            accessorFn: index => index,
            cell: ({row}) => {
                const index = row.getValue("historyOverview_7d_chart") as Index;
                return (
                    <div className={`lowercase ${index.historyOverview.days7 < 0 ? "text-red-500" : "text-green-500"}`}>
                        <IndexPreviewAreaChart index={index} />
                    </div>
                ); // Safely render the value
            },
            header: renderColumnSortedHeader("7d Chart"),
            meta: {
                text: "7d Chart",
            },
        },
        {
            id: "historyOverview_total",
            accessorFn: row => row.historyOverview?.total, // Ensure total resolves correctly
            cell: ({row}) => {
                const value = row.getValue("historyOverview_total") as number;
                return (
                    <div className={`lowercase ${value < 0 ? "text-red-500" : "text-green-500"}`}>
                        {renderSafelyNumber(value, NumeralFormat.PERCENT)}
                    </div>
                ); // Format and handle null/undefined
            },
            header: renderColumnSortedHeader("Total %"),
            meta: {
                text: "Total %",
            },
        },
        {
            accessorKey: "startTime",
            cell: ({row}) => {
                const value = row.getValue("startTime") as number;
                return <div className="lowercase">{moment(value).utc().startOf("day").format(MomentFormat.DATE)}</div>; // Format and handle null/undefined
            },
            header: renderColumnSortedHeader("Start from"),
            meta: {
                text: "Start from",
            },
        },
        {
            header: "Duration",
            cell: ({row}) => {
                const startTime = row.getValue("startTime") as number;

                // Calculate the duration difference in days
                const now = moment().utc().startOf("day");
                const start = moment(startTime).utc().startOf("day");
                const duration = moment.duration(now.diff(start)); // Create a moment duration

                // Break down the duration into years, months, and days
                const years = duration.years() > 0 ? `${duration.years()} year${duration.years() > 1 ? "s" : ""} ` : "";
                const months =
                    duration.months() > 0 ? `${duration.months()} month${duration.months() > 1 ? "s" : ""} ` : "";
                const days = duration.days() > 0 ? `${duration.days()} day${duration.days() > 1 ? "s" : ""}` : "";

                // Combine the outputs
                return <div className="lowercase">{`${years}${months}${days}`.trim() || "0 days"}</div>;
            },
            meta: {
                text: "Duration",
            },
        },
    ];

    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    });

    return (
        <div className="w-full">
            <div className="flex items-center py-4">
                <Input
                    placeholder="Filter names..."
                    value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                    onChange={event => table.getColumn("name")?.setFilterValue(event.target.value)}
                    className="max-w-sm"
                />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="ml-auto">
                            Columns <ChevronDown />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {table
                            .getAllColumns()
                            .filter(column => column.getCanHide())
                            .map(column => {
                                return (
                                    <DropdownMenuCheckboxItem
                                        key={column.id}
                                        className="capitalize"
                                        checked={column.getIsVisible()}
                                        onCheckedChange={value => column.toggleVisibility(!!value)}
                                    >
                                        {(column.columnDef.meta as {text: ReactNode})?.text ?? column.id}
                                    </DropdownMenuCheckboxItem>
                                );
                            })}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map(headerGroup => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map(header => {
                                    const className = header.id === "assets" ? "w-1/4" : "";

                                    return (
                                        <TableHead key={header.id} className={className}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map(row => (
                                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                                    {row.getVisibleCells().map(cell => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
                <div className="space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    );
}
