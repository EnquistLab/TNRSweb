module.exports = {
  trailingSlash: true,
  env: {
    // development
   // apiServer: "http://vegbiendev.nceas.ucsb.edu:9975/",
    // production
     apiServer: "https://tnrsapi.xyz/",
   // apiServer: "http://tnrsapidev.xyz/tnrs_api.php",
    // development (Private)
    //  apiEndPoint: "http://vegbiendev.nceas.ucsb.edu:8975/tnrs_api.php",
      // development (Public)
      // apiEndPoint: "http://vegbiendev.nceas.ucsb.edu:9975/tnrs_api.php",
      // production
    // apiEndPoint: "http://tnrsapidev.xyz/tnrs_api.php",
     apiEndPoint: "https://tnrsapi.xyz/tnrs_api.php",
    defaultMatchingThreshold: .53
  },
};
