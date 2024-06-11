import { useState } from "react";
import { Parser } from "json2csv";
import { saveAs } from "file-saver";
import {
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  Box,
} from "@material-ui/core";

export function DownloadResolvedResults({ data, queryType }) {
  const [open, setOpen] = useState(false);
  const [fileName, setFileName] = useState("tnrs_result");
  const [fileFormat, setFileFormat] = useState("csv");
  const [matchesToDownload, setMatchesToDownload] = useState("all");

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
      <>
        <Button variant="outlined" color="primary" onClick={handleClickOpen}>
          Download Data
        </Button>
        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>Download Options</DialogTitle>
          <DialogContent>
            <Box>
              <TextField
                  id="outlined-helperText"
                  label="File Name"
                  defaultValue={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  variant="outlined"
                  fullWidth
              />
            </Box>
            <Box mt={4}>
              <FormControl>
                <FormLabel>Download Format</FormLabel>
                <RadioGroup
                    value={fileFormat}
                    onChange={(e) => setFileFormat(e.target.value)}
                >
                  <FormControlLabel value="csv" control={<Radio />} label="CSV" />
                  <FormControlLabel value="tsv" control={<Radio />} label="TSV" />
                </RadioGroup>
              </FormControl>
            </Box>
            {queryType !== "syn" && (
                <Box mt={2}>
                  <FormControl>
                    <FormLabel>Results to Download</FormLabel>
                    <RadioGroup
                        value={matchesToDownload}
                        onChange={(e) => setMatchesToDownload(e.target.value)}
                    >
                      <FormControlLabel
                          value="best"
                          control={<Radio />}
                          label="Best Matches Only"
                      />
                      <FormControlLabel
                          value="all"
                          control={<Radio />}
                          label="All Matches"
                      />
                    </RadioGroup>
                  </FormControl>
                </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="primary">
              Cancel
            </Button>
            <Button
                onClick={() =>
                    generateDownloadFile(data, fileName, fileFormat, matchesToDownload, queryType)
                }
                color="primary"
            >
              Download
            </Button>
          </DialogActions>
        </Dialog>
      </>
  );
}

const generateDownloadFile = (data, fileName, fileFormat, matchesToDownload, queryType) => {
  const cleanedData = data.map((item) => {
    const { WarningsEng, selected, unique_id, ...rest } = item;
    const Best_match_highertaxa = item.Highertaxa_score_order?.includes("1");
    const Best_match_overall_score = item.Overall_score_order?.includes("1");
    return {
      ...rest,
      unique_id: item.ID,
      Warnings: item.Warnings,
      Best_match_overall_score,
      Best_match_highertaxa,
      Overall_score_order: item.Overall_score_order,
    };
  });

  if (queryType === "syn") {
    cleanedData.forEach((item) => {
      delete item.Best_match_overall_score;
      delete item.Best_match_highertaxa;
      delete item.Overall_score_order;
      delete item.unique_id;
      delete item.Warnings;
    });
  }

  cleanedData.sort((a, b) => {
    if (a.unique_id !== b.unique_id) {
      return a.unique_id - b.unique_id;
    } else {
      return a.Overall_score_order - b.Overall_score_order;
    }
  });

  let downloadData;
  if (matchesToDownload === "best" && queryType !== "syn") {
    downloadData = cleanedData.filter(f => f.Best_match_overall_score === true);
  } else {
    downloadData = cleanedData;
  }

  let fields = Object.keys(cleanedData[0]);
  let opts = fileFormat === "tsv" ? { fields, delimiter: "\t" } : { fields };

  const parser = new Parser(opts);

  try {
    const fileContent = parser.parse(downloadData);
    const fileBlob = new Blob([fileContent], { type: "text/plain;charset=utf-8" });
    saveAs(fileBlob, `${fileName}.${fileFormat}`);
  } catch (error) {
    console.error(error);
  }
};
