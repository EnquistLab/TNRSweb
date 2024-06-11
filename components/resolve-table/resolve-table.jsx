import { useState, useEffect } from "react";
import _ from "lodash";
import { WarningTwoTone as WarningTwoToneIcon } from "@material-ui/icons";
import {
    Box,
    TableContainer,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Table,
    TablePagination,
    TableSortLabel,
    Link,
    Typography,
} from "@material-ui/core";

import { TablePaginationActions } from "../";
import { WarningsPopover } from "./warnings";
import { SelectRowDialog } from "./select-row";
import { DetailsDialog } from "./resolve-details-dialog";
import { mkSourceLinks, mkAcceptedNameLinks, mkSynonymLinks } from "./links";
import { roundScore } from "../../actions";
import { getComparator, stableSort } from "../../actions";

export function ResolveTable({ tableData, onChangeSelectedRow, queryType }) {
    const [popUpOpen, setPopUpOpen] = useState(false);
    const [dataPopUpOpen, setDataPopUpOpen] = useState(false);
    const [popUpRows, setPopUpRows] = useState([]);
    const [popUpDetails, setPopUpDetails] = useState({});
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [orderBy, setOrderBy] = useState("");
    const [order, setOrder] = useState("asc");

    const tableDataSelected = queryType === 'syn' ? tableData : tableData.filter((row) => row.selected === true);

    const getRows = (id) => tableData.filter((row) => row.ID === id);
    const getRowData = (id) => tableDataSelected.filter((row) => row.ID === id)[0];

    const handleChangePage = (event, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };
    const handleClickClose = () => {
        setPopUpOpen(false);
        setDataPopUpOpen(false);
    };
    const handleRequestSort = (event, property) => {
        const isAsc = orderBy === property && order === "asc";
        setOrder(isAsc ? "desc" : "asc");
        setOrderBy(property);
    };

    const renderRow = (row) => {
        if (row.error) {
            return (
                <TableRow key="error">
                    <TableCell>{row.Name_submitted}</TableCell>
                    <TableCell>[No Match Found]</TableCell>
                    <TableCell colSpan={5} align="center">
                        <Typography variant="body1" color="textSecondary">
                            {row.error}
                        </Typography>
                    </TableCell>
                </TableRow>
            );
        }

        if (queryType === 'syn') {
            return (
                <TableRow key={row.unique_id}>
                    <TableCell>{row.submitted_name}</TableCell>
                    <TableCell>{row.matched_nameWithAuthor || "[No Match Found]"}</TableCell>
                    <TableCell>{row.matched_taxonomicStatus}</TableCell>
                    <TableCell>
                        <Link href={row.accepted_nameUrl} target="_blank" rel="noopener">
                            {row.accepted_nameWithAuthor}
                        </Link>
                    </TableCell>
                    <TableCell>
                        {row.syn_nameUrl ? (
                            <Link href={row.syn_nameUrl} target="_blank" rel="noopener">
                                {row.syn_nameWithAuthor}
                            </Link>
                        ) : (
                            row.syn_nameWithAuthor
                        )}
                    </TableCell>
                    <TableCell>{row.syn_taxonomicStatus}</TableCell>
                    <TableCell>{row.accepted_nameWithAuthor_strict}</TableCell>
                    <TableCell>
                        <Link
                            href="#"
                            onClick={() => {
                                setDataPopUpOpen(true);
                                setPopUpDetails(row);
                            }}
                        >
                            Details
                        </Link>
                    </TableCell>
                </TableRow>
            );
        } else {
            const allRows = getRows(row.ID);
            const rowData = getRowData(row.ID);
            return (
                <TableRow key={row.unique_id}>
                    <TableCell>
                        {row.Warnings && <WarningsPopover warnings={row.Warnings} />}
                    </TableCell>
                    <TableCell>{row.Name_submitted}</TableCell>
                    <TableCell>
                        {row.Name_matched === "[No Match Found]" ? "[No Match Found]" : `${row.Name_matched} ${row.Canonical_author}`}
                        {allRows.length > 1 && row.Name_matched !== "[No Match Found]" && (
                            <Link
                                href="#"
                                onClick={() => {
                                    setPopUpRows(allRows);
                                    setPopUpOpen(true);
                                }}
                            >
                                {" (+" + (allRows.length - 1) + " more)"}
                            </Link>
                        )}
                    </TableCell>
                    <TableCell>{row.Name_matched === "[No Match Found]" ? "" : row.Source}</TableCell>
                    <TableCell>
                        {row.Overall_score !== "" && row.Name_matched !== "[No Match Found]" ? roundScore(row.Overall_score) : ""}
                    </TableCell>
                    <TableCell>{row.Taxonomic_status !== "" && row.Name_matched !== "[No Match Found]" ? row.Taxonomic_status : ""}</TableCell>
                    <TableCell>
                        {row.Accepted_name !== "" && row.Name_matched !== "[No Match Found]" ? `${row.Accepted_name} ${row.Accepted_name_author}` : ""}
                        {row.Name_matched !== "[No Match Found]" && mkAcceptedNameLinks(row)}
                    </TableCell>
                    <TableCell>
                        {row.Name_matched !== "[No Match Found]" && (
                            <Link
                                href="#"
                                onClick={() => {
                                    setDataPopUpOpen(true);
                                    setPopUpDetails(rowData);
                                }}
                            >
                                Details
                            </Link>
                        )}
                    </TableCell>
                </TableRow>
            );
        }
    };


    return (
        <>
            <Box mx={2}>
                <TableContainer>
                    <Table size="small">
                        <EnhancedTableHead
                            order={order}
                            orderBy={orderBy}
                            onRequestSort={handleRequestSort}
                            queryType={queryType}
                        />
                        <TableBody>
                            {stableSort(tableDataSelected, getComparator(order, orderBy))
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map(renderRow)}
                            {queryType !== 'syn' && tableDataSelected.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={8} align="center">
                                        <Typography variant="body1" color="textSecondary">
                                            No matches found
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                    <TablePagination
                        rowsPerPageOptions={[10, 25, 100]}
                        component="div"
                        count={tableDataSelected.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onChangePage={handleChangePage}
                        onChangeRowsPerPage={handleChangeRowsPerPage}
                        ActionsComponent={TablePaginationActions}
                    />
                </TableContainer>
            </Box>

            <SelectRowDialog
                open={popUpOpen}
                onClose={handleClickClose}
                rows={popUpRows}
                handleChangeSelectedRow={onChangeSelectedRow}
            />

            <DetailsDialog
                open={dataPopUpOpen}
                onClose={handleClickClose}
                row={popUpDetails}
                queryType={queryType}
            />
        </>
    );
}

function EnhancedTableHead(props) {
    const { order, orderBy, onRequestSort, queryType } = props;

    const createSortHandler = (property) => (event) => {
        onRequestSort(event, property);
    };

    const tableColumns = queryType === 'syn' ? [
        ["submitted_name", "Name Submitted"],
        ["matched_nameWithAuthor", "Matched Name"],
        ["matched_taxonomicStatus", "Matched Status"],
        ["accepted_nameWithAuthor", "Accepted Name"],
        ["syn_nameWithAuthor", "Synonym"],
        ["syn_taxonomicStatus", "Synonym Status"],
        ["accepted_nameWithAuthor_exact", "Synonym Accepted Name (Strict)"],
    ] : [
        ["Name_submitted", "Name Submitted"],
        ["Name_matched", "Name Matched"],
        ["Source", "Source"],
        ["Overall_score", "Overall Score"],
        ["Taxonomic_status", "Taxonomic Status"],
        ["Accepted_name", "Accepted Name"],
    ];

    return (
        <TableHead>
            <TableRow>
                {queryType !== 'syn' && (
                    <TableCell>
                        <TableSortLabel
                            active={orderBy === "Warnings"}
                            direction={orderBy === "Warnings" ? order : "asc"}
                            onClick={createSortHandler("Warnings")}
                        >
                            <WarningTwoToneIcon fontSize="small" />
                        </TableSortLabel>
                    </TableCell>
                )}
                {tableColumns.map((names, idx) => (
                    <TableCell key={idx}>
                        <TableSortLabel
                            active={orderBy === names[0]}
                            direction={orderBy === names[0] ? order : "asc"}
                            onClick={createSortHandler(names[0])}
                        >
                            {names[1]}
                        </TableSortLabel>
                    </TableCell>
                ))}
                <TableCell>Details</TableCell>
            </TableRow>
        </TableHead>
    );
}
