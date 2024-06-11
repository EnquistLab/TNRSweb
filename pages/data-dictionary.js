import { Layout } from "../components";
import { useState, useEffect } from "react";
import {
    TableContainer,
    Paper,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Typography,
    Box
} from "@material-ui/core";

import { requestDataDictionary } from "../actions/";

function AboutApp() {
    const [dataDictionary, setDataDictionary] = useState([]);

    useEffect(() => {
        async function fetchData() {
            let dd = await requestDataDictionary();
            setDataDictionary(dd);
        }
        fetchData();
    }, []);

    const renderTable = (mode, title) => (
        <Box mt={4} mb={4}>
            <Typography variant="h4" gutterBottom>{`Processing Mode: ${title}`}</Typography>
            <Box mt={4} mb={4}></Box>
            <TableContainer component={Paper}>
                <Table aria-label={`data dictionary table for ${title}`}>
                    <TableHead>
                        <TableRow>
                            <TableCell>Column Name</TableCell>
                            <TableCell>Data Type</TableCell>
                            <TableCell>Description</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {dataDictionary
                            .filter(row => row.mode === mode)
                            .map((row, k) => (
                                <TableRow key={k}>
                                    <TableCell>{row.col_name}</TableCell>
                                    <TableCell>{row.data_type}</TableCell>
                                    <TableCell>{row.description}</TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );

    return (
        <>
            <Layout>
                {renderTable("resolve", "Perform Name Resolution")}
                {renderTable("parse", "Parse Names Only")}
                {renderTable("syn", "Get Synonyms")}
            </Layout>
        </>
    );
}

export default AboutApp;
