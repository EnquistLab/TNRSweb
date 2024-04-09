import { useState, useEffect } from "react";
import { useStyles } from "./options-box.style";
import {
  Paper,
  Box,
  InputLabel,
  MenuItem,
  Select,
  FormControlLabel,
  FormControl,
  FormLabel,
  Switch,
  Link,
  Chip,
} from "@material-ui/core";

import { requestSources, requestFamilyClassifications } from "../../actions";

export function OptionsBox({
                             queryType,
                             onChangeQueryType,
                             onChangeSources,
                             onChangeFamily,
                           }) {
  const classes = useStyles();

  // sources and familiesAvailable
  const [familiesAvailable, setFamiliesAvailable] = useState([]);
  const [familyQuery, setFamilyQuery] = useState("");
  // populate souce state with sources available
  const [sourcesState, setSourcesState] = useState([]);
  const [selectedSources, setSelectedSources] = useState([]);
  const [selectedSourceScope, setSelectedSourceScope] = useState("global");

  useEffect(() => {
    async function fetchData() {
      let sources = await requestSources();
      // get only the names
      let families = await requestFamilyClassifications();

      setSourcesState(
          sources.map((source) => ({
            name: source.sourceName,
            enabled: source.isDefault === "1",
            scope: source.scope,
          }))
      );

      setFamiliesAvailable(families);
      setFamilyQuery(families[0].sourceName);

      // push names up to index
      let enabledSources = sources
          .filter((s) => s.isDefault === "1")
          .map((s) => s.sourceName);
      setSelectedSources(enabledSources);
      onChangeSources(enabledSources.join(","));
      onChangeFamily(families[0].sourceName);
    }

    fetchData();
  }, []);

  // controls the behavior of the user when he clicks the switch
  const handleChangeSources = (name) => {
    let newSelectedSources;
    if (selectedSources.includes(name)) {
      newSelectedSources = selectedSources.filter(source => source !== name);
    } else {
      newSelectedSources = [...selectedSources, name];
    }
    setSelectedSources(newSelectedSources);

    let sourceNames = newSelectedSources.join(",");
    onChangeSources(sourceNames);

    const updatedSourcesState = sourcesState.map(source => ({
      ...source,
      enabled: newSelectedSources.includes(source.name),
    }));
    setSourcesState(updatedSourcesState);
  };

  const handleSelectFamily = (name) => {
    onChangeFamily(name);
    setFamilyQuery(name);
  };

  const handleSourceScopeChange = (newScope) => {
    setSelectedSourceScope(newScope);
  };

  const handleDeselectSource = (sourceName) => {
    handleChangeSources(sourceName);
  };

  const filteredSources = sourcesState.filter((source) => source.scope === selectedSourceScope);

  return (
      <Paper className={classes.paper}>
        <Box p={2}>
          <Box>
            <InputLabel>Processing Mode</InputLabel>
            <FormControl variant="outlined" fullWidth>
              <Select value={queryType} onChange={(e) => onChangeQueryType(e.target.value)}>
                <MenuItem value={"resolve"}>Perform name resolution</MenuItem>
                <MenuItem value={"parse"}>Parse names only</MenuItem>
              </Select>
            </FormControl>
          </Box>
          {queryType === "resolve" && (
              <>
                <Box pt={2}>
                  <InputLabel>Family Classification</InputLabel>
                  <FormControl variant="outlined" fullWidth>
                    <Select value={familyQuery} onChange={(e) => handleSelectFamily(e.target.value)}>
                      {familiesAvailable.map((f) => (
                          <MenuItem key={f.sourceName} value={f.sourceName}>
                            {f.sourceName.toUpperCase()}
                          </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
                <Box pt={1.5}>
                  <FormLabel component="legend">
                    <Link href="/sources" target="_blank" rel="noopener noreferrer">Taxonomic Sources</Link>
                  </FormLabel>
                  <FormControl variant="outlined" fullWidth>
                    <Select
                        value={selectedSourceScope}
                        onChange={(e) => handleSourceScopeChange(e.target.value)}
                    >
                      <MenuItem value="global">Global Taxonomic Sources</MenuItem>
                      <MenuItem value="limited">Taxonomic Source of Limited Taxonomic or Geographic Scope</MenuItem>
                    </Select>
                  </FormControl>
                  <Box pt={1}>
                    {filteredSources.map((s) => (
                        <FormControlLabel
                            key={s.name}
                            control={
                              <Switch
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleChangeSources(s.name);
                                  }}
                                  checked={selectedSources.includes(s.name)}
                              />
                            }
                            label={
                              <Link
                                  href={`/sources#source-${s.name.toLowerCase()}`}
                                  underline="hover"
                                  target="_blank"
                                  rel="noopener noreferrer"
                              >
                                {s.name.toUpperCase()}
                              </Link>
                            }
                        />
                    ))}
                    <Box pt={2}>
                      {selectedSources.map((source) => (
                          <Chip
                              key={source}
                              label={source}
                              onDelete={() => handleDeselectSource(source)}
                              color="primary"
                          />
                      ))}
                    </Box>
                  </Box>
                </Box>
              </>
          )}
        </Box>
      </Paper>
  );
}
