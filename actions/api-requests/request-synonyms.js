import axios from "axios";

const apiEndPoint = process.env.apiEndPoint;

export const requestSynonyms = async (queryNames, source) => {
    const synObject = {
        opts: {
            mode: "syn",
            sources: source, // Ensure 'sources' is included
        },
        data: queryNames,
    };
    return await axios
        .post(apiEndPoint, synObject, {
            headers: { "Content-Type": "application/json" },
        })
        .then((response) => {
            return response.data;
        });
};