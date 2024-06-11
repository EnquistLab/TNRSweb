import { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { Paper, TextField, Box, Button, CircularProgress } from '@material-ui/core';
import { useStyles } from './search-box.style';

export function SearchBox({ onSearch, loadingStatus, queryType }) {
  const [input, setInput] = useState('');
  const fileInputRef = useRef();
  const classes = useStyles();

  const onDrop = useCallback((acceptedFiles) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setInput(reader.result);
      };
      reader.readAsText(file);
    });
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    noClick: true,
  });

  const handleFileButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const predefinedData = `Pinus ponderosa
Cephaelis elata
Psychotria sp.2
Asteraceae Hieracium billyanum var. parvum B. Retz
Cinchona condaminea Humb. & Bonpl.
Helotiaceae Diplothrix juniperifolia`;

  return (
      <Paper className={classes.paper} {...getRootProps()}>
        <input {...getInputProps()} ref={fileInputRef} style={{ display: 'none' }} />
        <Box
            display="flex"
            flexDirection="column"
            justifyContent="center"
            height={1}
        >
          <Box p={2}>
            <TextField
                rows={queryType === 'syn' ? 1 : 10} // Adjust rows based on query type
                multiline={queryType !== 'syn'}
                fullWidth
                variant="outlined"
                label="Scientific names to check"
                value={input}
                helperText={queryType === 'syn' ? "Enter one scientific name only" : "Enter up to 5000 scientific names or drag and drop a CSV/TXT file"}
                onChange={(e) => setInput(e.target.value)}
            />
          </Box>
          <Box
              p={2}
              pt={0}
              display="flex"
              flexDirection="row"
              alignItems="center"
          >
            <Box>
              <Button
                  disabled={loadingStatus}
                  onClick={() => onSearch(input)}
                  variant="contained"
                  color="primary"
                  style={{ marginRight: 10 }}
              >
                Submit
              </Button>
              <Button
                  onClick={() => setInput('')}
                  variant="contained"
                  color="secondary"
                  style={{ marginRight: 10 }}
              >
                Clear
              </Button>
              {queryType !== 'syn' && ( // Hide "Add File" button for "Get synonyms"
                  <Button
                      variant="contained"
                      onClick={handleFileButtonClick}
                  >
                    Add File
                  </Button>
              )}
            </Box>
            <Box flexGrow={1} />
            <Box>
              {queryType !== 'syn' && ( // Hide "Try Me!" button for "Get synonyms"
                  <Button
                  onClick={() => setInput(predefinedData)}
                  variant="contained"
                  color="primary"
                  style={{ marginRight: 10 }}
              >
                Try Me!
              </Button>
              )}
            </Box>
            <Box>
              {loadingStatus && <CircularProgress size={30} />}
            </Box>
          </Box>
        </Box>
      </Paper>
  );
}
