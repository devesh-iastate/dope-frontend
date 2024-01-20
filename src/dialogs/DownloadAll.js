// Importing necessary React and PrimeReact components
import React, { useState } from 'react';
import { Button } from 'primereact/button';

// DownloadAll Component Definition
const DownloadAll = ({ user }) => {
    // useState hook to manage loading state
    const [isLoading, setIsLoading] = useState(false);

    // Python script as a string
    const pythonScript = `
import pandas as pd
import json

'''
Input: Downloaded dope.json file from DOPE PORTAL and kept in the same folder as this python program file
Output: dope.csv downloaded to the same folder as this python program file. This file contains all the data in the csv format.
'''

with open('dope.json') as json_file:
    data = json.load(json_file)
    nRows = len(data)
    #Initialize a Dictionary
    fullData = []

    #Iterate
    for _k in range(nRows):
      #Initialize an empty subdictionary
      row = {}
      for key in data[_k]:
        if key != 'solvents' and key != 'uv_vis_nir_files' and key != 'skpm_files' and key != 'user':
          row[key] = data[_k][key]
        else:
          if key == 'solvents':
            row['CB'] = data[_k]['solvents'][0]['value']
            row['oDCB'] = data[_k]['solvents'][1]['value']
            row['Tol'] = data[_k]['solvents'][2]['value']

      #Append to fullData
      fullData.append(row)

      #Convert to Pandas and Write a CSV File
      df = pd.DataFrame(fullData)

      #Write to CSV
      df.to_csv('dope.csv', index=False)
`;

    // Function to create downloadable link for Python script
    const downloadPythonScript = () => {
        const encodedScript = encodeURIComponent(pythonScript);
        const scriptUrl = `data:text/plain;charset=utf-8,${encodedScript}`;
        const link = document.createElement('a');
        link.href = scriptUrl;
        link.download = "process_data.py"; // Name of the Python script file
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Function to handle the download process
    const handleDownload = async () => {
        // Setting loading state to true
        setIsLoading(true);
        try {
            // Name of the function to be called on the user object
            const functionName = "getAll";
            // Calling a function of the user object and waiting for its response
            const data = await user.callFunction(functionName);
            // Converting the response data to a JSON string
            const json = JSON.stringify(data);
            // Encoding the JSON string for URL compatibility
            const encodedJson = encodeURIComponent(json);
            // Creating a downloadable URL with the encoded JSON data
            const downloadUrl = `data:application/json;charset=utf-8,${encodedJson}`;
            // Creating a temporary link element for the download
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = "dope.json"; // Setting the filename for the download
            // Adding the link to the document and triggering the download
            document.body.appendChild(link);
            link.click();
            // Removing the link after download is initiated
            document.body.removeChild(link);
            downloadPythonScript(); // Downloading the Python script after the JSON data is downloaded
        } catch (error) {
            // Logging errors to the console if the download process fails
            console.error("Error fetching data:", error);
        }
        // Resetting the loading state after the download process is complete or fails
        setIsLoading(false);
    };

    // Render a button component from PrimeReact
    return (
        <Button
            label="Download All Data" // Button label
            className="ml-2" // Additional CSS class for styling
            onClick={handleDownload} // Event handler for click event
            disabled={isLoading} // Disabling the button during the download process
        />
    );
};

// Exporting the component for use in other parts of the application
export default DownloadAll;
