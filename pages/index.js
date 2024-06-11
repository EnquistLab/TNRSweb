import { useState, useEffect } from "react";
import Head from "next/head";
import { Grid, Box, Container, Paper, Button } from "@material-ui/core";
import {
  SearchBox,
  OptionsBox,
  ResolveTable,
  Footer,
  TopBar,
  DownloadResolvedResults,
  DownloadParsedResults,
  ParseTable,
  BestMatchSettingsPopper,
  MatchThresholdPopper,
  DownloadSettings,
} from "../components/";

import {
  sortByColumn,
  requestResolveNames,
  requestParseNames,
  requestSynonyms,
  applyMatchThreshold,
} from "../actions";

import _ from "lodash";

const splitNames = (names) => {
  return names
      // break lines
      .split("\n")
      // remove extra white spaces
      .map((name) => name.replace(/\s+/g, " ").trim())
      // remove empty lines
      .filter((f) => f.length > 0)
      // add index starting from 1
      .map((v, i) => [i + 1, v]);
};

function IndexApp() {
  // state where we keep the results that come from the API
  const [resolvedNames, setResolvedNames] = useState([]);
  // state where we store the parsed names
  const [parsedNames, setParsedNames] = useState([]);

  // we keep the sources selected by the user here
  const [sourcesQuery, setSourcesQuery] = useState("");
  // use the first family available
  const [familyQuery, setFamilyQuery] = useState("");

  // keep a status for when the system is loading
  const [loadingStatus, setLoadingStatus] = useState(false);

  // query options
  const [queryType, setQueryType] = useState("resolve");
  const [bestMatchingSetting, setBestMatchingSetting] = useState();
  const [queryTimeTracker, setQueryTime] = useState({ start: null, end: null });
  const [matchingThreshold, setMatchingThreshold] = useState(process.env.defaultMatchingThreshold);
  const [plantNames, setPlantNames] = useState("");


  const applyMatchThreshold = (results, threshold) => {
    return results.map(result => {
      if (result.Overall_score >= threshold) {
        return result;
      } else {
        return {
          ...result,
          Name_matched: "[No Match Found]",
          Overall_score: "",
          Name_score: "",
          Canonical_author: "",
          Taxonomic_status: "",
          Accepted_name: "",
          Accepted_name_author: "",
          Source: "",
          selected: false,
        };
      }
    });
  };

  // function to query data from the api
  const queryNames = (names) => {
    // Keep names from the search box
    setPlantNames(names);

    // Process names
    const queryNamesStr = splitNames(names);

    // Don't do anything if no names are provided
    if (names.length === 0) {
      return;
    }

    // Clear results
    setResolvedNames([]);
    setParsedNames([]);
    // Show spinner
    setLoadingStatus(true);

    // If the user wants to resolve the names
    if (queryType === "resolve") {
      // show spinner
      let start = Date();
      requestResolveNames(queryNamesStr, sourcesQuery, familyQuery).then((res) => {
        setLoadingStatus(false);
        setQueryTime({ start: start, end: Date() });
        setBestMatchingSetting("Overall_score_order");
        let thresholdFilteredNames = applyMatchThreshold(res, matchingThreshold);
        setResolvedNames(thresholdFilteredNames);
      });
    }

    // If the user wants to parse the names
    if (queryType === "parse") {
      requestParseNames(queryNamesStr).then((response) => {
        setLoadingStatus(false);
        setParsedNames(response);
      });
    }

    // If the user wants to get synonyms
    if (queryType === "syn") {
      requestSynonyms(queryNamesStr, sourcesQuery).then((response) => {
        setLoadingStatus(false);
        setResolvedNames(response); // Set all response data
      }).catch((error) => {
        setLoadingStatus(false);
        setResolvedNames([{ error: "No matches found" }]);
      });
    }
  };

  // when the user opens the dialog with multiple
  // if the user selects a different row,
  // this function will add true to that particular row
  const changeSelectedRowHandler = (rowToSelect) => {
    let new_results = resolvedNames.map((row) => {
      if (row.unique_id === rowToSelect.unique_id) {
        row.selected = true;
        return row;
      } else if (row.ID === rowToSelect.ID) {
        row.selected = false;
        return row;
      } else {
        return row;
      }
    });
    setResolvedNames(new_results);
  };

  // if the user decides to use a different column
  // to sort results, such as Higher_taxa_score_order
  const sortByColumnHandler = (column) => {
    let sortedData = sortByColumn(resolvedNames, column);
    setBestMatchingSetting(column);

    // Create a copy of the sorted data and update the selected property
    const updatedData = sortedData.map((row) => {
      return {
        ...row, // Spread the original row data
        selected: (column === "Highertaxa_score_order" && row.Highertaxa_score_order === "1") ||
            (column === "Overall_score_order" && row.Overall_score_order === "1")
      };
    });

    setResolvedNames(updatedData);
  };


  useEffect(() => {
    queryNames(plantNames);
  }, [matchingThreshold]);

  return (
      <>
        <Head>
          <script async src="https://www.googletagmanager.com/gtag/js?id=G-1S9WZXV58L"></script>
          <script
              dangerouslySetInnerHTML={{
                __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-1S9WZXV58L');
            `,
              }}
          />
          <title>TNRS - Taxonomic Name Resolution Service</title>
          <meta name="description" content="An online tool for the standardization of global taxonomic names."/>
          <meta
              name="keywords"
              content="TNRS, Plant Name Resolution, Taxonomic Name Resolution, web application, plant species, taxonomy, online tool, plant database, global taxonomic names, global taxonomic, taxonomic, Taxonomic, Botanical, checker, standardization, online tool, global taxonomic names, global"
          />
          <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"/>
          <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png"/>
          <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png"/>
          <link rel="manifest" href="/site.webmanifest"/>
          <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5"/>
          <meta name="msapplication-TileColor" content="#da532c"/>
          <meta name="theme-color" content="#ffffff"/>
          <meta property="og:title" content="TNRS - Taxonomic Name Resolution Service"/>
          <meta property="og:description" content="An online tool for the standardization of global taxonomic names."/>
          <meta property="og:image" content="/favicon-32x32.png"/>
          <meta property="og:url" content="https://tnrs.biendata.org"/>
          <meta name="twitter:title" content="TNRS - Taxonomic Name Resolution Service"/>
          <meta name="twitter:description" content="An online tool for the standardization of global taxonomic names."/>
          <meta name="twitter:url" content="https://tnrs.biendata.org"/>
          <meta name="twitter:image" content="/favicon-32x32.png"/>
          <meta name="twitter:card" content="An online tool for the standardization of global taxonomic names."/>
          <link rel="canonical" href="https://tnrs.biendata.org"/>
        </Head>
        <Box display="flex" flexDirection="column" minHeight="100vh">
          <Box>
            <TopBar />
          </Box>
          <Box flexGrow={1} my={2}>
            <main>
              <Container maxWidth="lg">
                <Grid spacing={2} direction="row" justify="center" alignItems="stretch" container>
                  <Grid lg={6} xs={12} item>
                    <SearchBox onSearch={queryNames} loadingStatus={loadingStatus} queryType={queryType} />
                  </Grid>
                  <Grid lg={6} xs={12} item>
                    <OptionsBox
                        queryType={queryType}
                        onChangeQueryType={(queryType) => setQueryType(queryType)}
                        onChangeFamily={(family) => setFamilyQuery(family)}
                        onChangeSources={(sources) => setSourcesQuery(sources)}
                    />
                  </Grid>
                  {resolvedNames.length > 0 && (
                      <Grid lg={12} xs={12} item>
                        <Paper>
                          <Box ml={2} pt={2} display="flex">
                            {queryType !== "syn" && (
                                <>
                                  <BestMatchSettingsPopper
                                      bestMatchingSetting={bestMatchingSetting}
                                      onClickSort={sortByColumnHandler}
                                  />
                                  <MatchThresholdPopper
                                      onChangeMatchingThreshold={(mt) => {
                                        // reapply the matching threshold
                                        setMatchingThreshold(mt);
                                      }}
                                      matchingThreshold={matchingThreshold}
                                  />
                                </>
                            )}
                            <DownloadResolvedResults data={resolvedNames} queryType={queryType} />
                            <DownloadSettings
                                settings={{
                                  time: queryTimeTracker,
                                  higherTaxonomy: bestMatchingSetting == "Highertaxa_score_order",
                                  familyClassification: familyQuery,
                                  sourcesSelected: sourcesQuery,
                                  jobType: queryType,
                                  matchingThreshold: matchingThreshold,
                                }}
                            />
                          </Box>
                          <Box pb={1}>
                            <ResolveTable
                                tableData={resolvedNames}
                                onChangeSelectedRow={changeSelectedRowHandler}
                                queryType={queryType}
                            />
                          </Box>
                        </Paper>
                      </Grid>
                  )}
                  {parsedNames.length > 0 && (
                      <Grid lg={12} xs={12} item>
                        <Paper>
                          <Box ml={2} pt={2} display="flex">
                            <DownloadParsedResults data={parsedNames} />
                          </Box>
                          <Box pb={1}>
                            <ParseTable tableData={parsedNames} />
                          </Box>
                        </Paper>
                      </Grid>
                  )}
                </Grid>
              </Container>
            </main>
          </Box>
          <Box>
            <Footer />
          </Box>
        </Box>
      </>
  );
}

export default IndexApp;
