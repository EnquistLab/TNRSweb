import axios from "axios";

const apiEndPoint = process.env.apiEndPoint;

export const requestDataDictionary = async () => {
  const query = {
    opts: {
      mode: "dd",
    },
  };

  return await axios
      .post(apiEndPoint, query, {
        headers: { "Content-Type": "application/json" },
      })
      .then(
          (response) => {
            return response.data;
          },
          () => {
            alert("There was an error while retrieving the data dictionary");
          }
      );
};
