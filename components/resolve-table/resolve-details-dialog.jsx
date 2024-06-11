import {
    Box,
    Dialog,
    DialogTitle,
    Button,
    TableContainer,
    TableRow,
    TableCell,
    TableBody,
    Table,
    Link,
} from "@material-ui/core";

export function DetailsDialog(props) {
    const { onClose, open, row, queryType } = props;

    // make a copy of the object being displayed
    let dataToDisplay = { ...row };

    delete dataToDisplay.selected; // Remove old 'selected' field

    // Fields to display for the "syn" query type
    const synFields = [
        "submitted_name",
        "matched_nameWithAuthor",
        "matched_taxonomicStatus",
        "accepted_nameWithAuthor",
        "accepted_nameUrl",
        "syn_nameWithAuthor",
        "syn_nameUrl",
        "syn_taxonomicStatus",
        "accepted_nameWithAuthor_exact",
        "accepted_nameWithAuthor_strict",
    ];

    // delete unnecessary fields for other query types
    const deleteFields = [
        "unique_id",
        "ID",
        "Canonical_author",
        "Name_matched_url",
        "Name_matched_lsid",
        "Accepted_name_url",
        "Overall_score_order",
        "Highertaxa_score_order",
        "Accepted_name_lsid",
        "Accepted_name_id",
        "Accepted_name_rank",
        "Family_submitted",
        "Specific_epithet_submitted",
        "Genus_submitted",
        "Author_submitted",
        "Name_matched_id",
        "WarningsEng",
    ];

    if (queryType !== 'syn') {
        deleteFields.forEach((field) => delete dataToDisplay[field]);
    } else {
        dataToDisplay = Object.fromEntries(
            Object.entries(dataToDisplay).filter(([key]) => synFields.includes(key))
        );
    }

    return (
        <Dialog open={open} maxWidth="lg">
            <DialogTitle>Name submitted: {dataToDisplay.submitted_name}</DialogTitle>
            <Box m={4} mt={0}>
                <TableContainer>
                    <Table size="small">
                        <TableBody>
                            {Object.entries(dataToDisplay).map(([key, value], idx) => (
                                <TableRow key={idx}>
                                    <TableCell>{key}</TableCell>
                                    <TableCell>
                                        {key.includes("Url") ? (
                                            <Link href={value} target="_blank" rel="noopener">
                                                {value}
                                            </Link>
                                        ) : (
                                            value
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <Button variant="contained" color="primary" onClick={onClose}>
                    Close
                </Button>
            </Box>
        </Dialog>
    );
}
