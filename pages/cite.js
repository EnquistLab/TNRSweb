import { Layout } from "../components";
import { useState, useEffect } from "react";

import {
  Typography,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Link,
} from "@material-ui/core";

import { requestCitations } from "../actions";

const Cite = require("citation-js");

function BibTexDialog({ displayText }) {
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <Link href="#" onClick={handleClickOpen}>
        [bibtex]
      </Link>
      <Dialog maxWidth={"md"} fullWidth open={open} onClose={handleClose}>
        <DialogTitle id="alert-dialog-title">{"BibTeX entry"}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {displayText}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

function HowCiteApp() {
  let [publicCitation, setPublicCitation] = useState('');
  let [tnrsCitation, setTnrsCitation] = useState('');
  let [sourcesCitations, setSourcesCitations] = useState([]);

  useEffect(() => {
    async function fetchData() {
      // get citations from the API
      let citations = await requestCitations();

      var parsedCitations = []
      // parse them using citation-js
      for (let c in citations) {
        let parsed = new Cite(citations[c].citation);

        let formatted = parsed.format('bibliography', {
          format: 'html',
          template: 'apa',
          lang: 'en-US'
        })
        // push everything to the vector
        parsedCitations.push({ 'source': citations[c].source, 'parsed': parsed, 'raw': citations[c].citation, 'formatted': formatted })
      }

      // split by subheader
      let pub = parsedCitations.filter(o => o.source === 'tnrs_pub')[0]
      let tnrs = parsedCitations.filter(o => o.source === 'tnrs')[0]
      let sources = parsedCitations.filter(o => o.source !== 'tnrs').filter(o => o.source !== 'tnrs_pub')

      // set state
      setPublicCitation(pub)
      setTnrsCitation(tnrs)
      setSourcesCitations(sources)
    }
    fetchData();
  }, []);


  return (
    <>
      <Layout>
        <Typography variant="h3" align="justify" display="block" gutterBottom>
          How to Cite the TNRS
        </Typography>

        <Typography variant="h5" gutterBottom align="justify">
          To cite the Taxonomic Name Resolution Service:
        </Typography>
        <div>
          <div
            dangerouslySetInnerHTML={{
              __html: tnrsCitation.formatted,
            }}
          ></div>
          <BibTexDialog displayText={tnrsCitation.raw} />
          <br />
        </div>

        <Typography variant="h5" gutterBottom align="justify">
          If results derived from the TNRS are used in a publication, please
          cite:
        </Typography>
        <div>
          <div
            dangerouslySetInnerHTML={{
              __html: publicCitation.formatted,
            }}
          ></div>
          <BibTexDialog displayText={publicCitation.raw} />
          <br />
        </div>

        <Typography variant="h5" gutterBottom align="justify">
          Please acknowledge separately the individual taxonomic sources used to
          process your data:
        </Typography>
        {sourcesCitations.map((s, k) => (
          <div key={k}>
            <div
              dangerouslySetInnerHTML={{
                __html: s.formatted,
              }}
            ></div>
            <BibTexDialog displayText={s.raw} />
            <br />
          </div>
        ))}

      </Layout>
    </>
  );
}

export default HowCiteApp;
