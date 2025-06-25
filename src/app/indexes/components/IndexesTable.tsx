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
import {Asset, Id, IndexOverview, MaxDrawDown} from "@/utils/types/general.types";
import {NumeralFormat} from "@numeral";
import {renderSafelyNumber} from "@/utils/heleprs/ui/renderSavelyNumber.helper";
import {ReactNode} from "react";
import {getChartColorClassname, getIndexDurationLabel, getIndexStartFromLabel} from "@/app/indexes/helpers";
import Link from "next/link";
import {CreateIndex} from "@/app/indexes/components/Index/CreateIndex";
import {IndexHistoryOverviewChart} from "@/app/indexes/components/IndexHistoryOverviewChart";
import {HISTORY_OVERVIEW_DAYS} from "@/utils/constants/general.constants";
import {actionDeleteIndexOverview} from "@/app/indexes/[id]/actions";

export default function IndexesTable({data}: {data: IndexOverview[]}) {
    const [sorting, setSorting] = React.useState<SortingState>([{desc: true, id: "historyOverview_total"}]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});

    const [deletingIndexId, setDeletingIndexId] = React.useState<Id>();

    const renderColumnSortedHeader =
        (header: ReactNode): ColumnDef<IndexOverview>["header"] =>
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

    const handleDeleteIndex = (index: IndexOverview) => async () => {
        try {
            if (index.systemId) {
                return;
            }

            setDeletingIndexId(index.id);
            await actionDeleteIndexOverview(index.id); // need tls
        } finally {
            setDeletingIndexId(undefined);
        }
    };

    const columns: ColumnDef<IndexOverview>[] = [
        {
            accessorKey: "rank",
            header: "#",
            cell: ({row}) => <div className="capitalize">{row.index + 1}</div>,
        },
        {
            accessorKey: "name",
            cell: ({row}) => (
                <Link className="capitalize underline" href={`/indexes/${row.original.id}`}>
                    {row.getValue("name")}
                </Link>
            ),
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
                    <div className={`lowercase ${getChartColorClassname(value)}`}>
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
                    <div className={`lowercase ${getChartColorClassname(value)}`}>
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
            id: `historyOverview_${HISTORY_OVERVIEW_DAYS}d_chart`,
            accessorFn: indexOverview => indexOverview,
            cell: ({row}) => {
                const indexOverview = row.getValue(`historyOverview_${HISTORY_OVERVIEW_DAYS}d_chart`) as IndexOverview;

                return (
                    <div className={`lowercase ${getChartColorClassname(indexOverview.historyOverview.days7)}`}>
                        <IndexHistoryOverviewChart indexOverview={indexOverview} />
                    </div>
                ); // Safely render the value
            },
            header: renderColumnSortedHeader(`${HISTORY_OVERVIEW_DAYS}d Chart`),
            meta: {
                text: `${HISTORY_OVERVIEW_DAYS}d Chart`,
            },
        },
        {
            id: "maxDrawDown_value",
            accessorFn: row => row.maxDrawDown.value, // Ensure maxDrawDown resolves correctly
            cell: ({row}) => {
                const maxDrawDownValue = row.getValue("maxDrawDown_value") as MaxDrawDown["value"];

                return (
                    <div className={`lowercase ${getChartColorClassname(maxDrawDownValue)}`}>
                        {renderSafelyNumber(maxDrawDownValue / 100, NumeralFormat.PERCENT)}
                    </div>
                ); // Format and handle null/undefined
            },
            header: renderColumnSortedHeader("Max DrawDown %"),
            meta: {
                text: "Max DrawDown %",
            },
        },
        {
            id: "historyOverview_total",
            accessorFn: row => row.historyOverview?.total, // Ensure total resolves correctly
            cell: ({row}) => {
                const value = row.getValue("historyOverview_total") as number;
                return (
                    <div className={`lowercase ${getChartColorClassname(value)}`}>
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
                const startTime = row.getValue("startTime") as number;

                return <div className="lowercase">{getIndexStartFromLabel(startTime)}</div>; // Format and handle null/undefined
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

                return <div className="lowercase">{getIndexDurationLabel(startTime)}</div>;
            },
            meta: {
                text: "Duration",
            },
        },
        {
            header: "Actions",
            cell: ({row}) => {
                const index = row.original as unknown as IndexOverview;

                if (index.systemId) {
                    return null;
                }

                return (
                    <button
                        type={"button"}
                        className="lowercase bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
                        onClick={handleDeleteIndex(index)}
                        disabled={String(deletingIndexId) === String(index.id)}
                    >
                        Delete
                    </button>
                );
            },
            meta: {
                text: "Actions",
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
                <CreateIndex />

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
