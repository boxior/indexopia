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
import {ChevronDown} from "lucide-react";

import {Button} from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {Input} from "@/components/ui/input";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Index, MomentFormat} from "@/utils/types/general.types";
import {NumeralFormat} from "@numeral";
import {renderSafelyNumber} from "@/utils/heleprs/renderSavelyNumber.helper";
import moment from "moment";

export default function IndexesTable({data}: {data: Index[]}) {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});

    const columns: ColumnDef<Index>[] = [
        {
            accessorKey: "rank",
            header: "#",
            cell: ({row}) => <div className="capitalize">{row.getValue("rank")}</div>,
        },
        {
            accessorKey: "name",
            header: "Index",
            cell: ({row}) => <div className="capitalize">{row.getValue("name")}</div>,
        },
        {
            accessorKey: "assets",
            header: "Assets",
            cell: ({row}) => <div className="lowercase">{row.getValue("name")}</div>,
        },
        {
            id: "historyOverview_24h",
            accessorFn: row => row.historyOverview?.days1, // Ensure this resolves correctly
            header: "24h %",
            cell: ({row}) => {
                const value = row.getValue("historyOverview_24h") as number;
                return <div className="lowercase">{renderSafelyNumber(value, NumeralFormat.PERCENT)}</div>; // Safely handle null/undefined
            },
        },
        {
            id: "historyOverview_7d",
            accessorFn: row => row.historyOverview?.days7, // Access only the needed value
            header: "7d %",
            cell: ({row}) => {
                const value = row.getValue("historyOverview_7d") as number;
                return <div className="lowercase">{renderSafelyNumber(value, NumeralFormat.PERCENT)}</div>; // Safely render the value
            },
        },
        {
            id: "historyOverview_total",
            accessorFn: row => row.historyOverview?.total, // Ensure total resolves correctly
            header: "Total %",
            cell: ({row}) => {
                const value = row.getValue("historyOverview_total") as number;
                return <div className="lowercase">{renderSafelyNumber(value, NumeralFormat.PERCENT)}</div>; // Format and handle null/undefined
            },
        },
        {
            accessorKey: "startTime",
            header: "Start from",
            cell: ({row}) => {
                const value = row.getValue("startTime") as number;
                return <div className="lowercase">{moment(value).utc().startOf("day").format(MomentFormat.DATE)}</div>; // Format and handle null/undefined
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
                                        {column.id}
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
                                    return (
                                        <TableHead key={header.id}>
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
                <div className="flex-1 text-sm text-muted-foreground">
                    {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length}{" "}
                    row(s) selected.
                </div>
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
