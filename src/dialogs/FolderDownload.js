import React, { useContext } from 'react';
import axios from 'axios';
import { Button } from 'primereact/button';
import { UserContext } from "../contexts/user.context";

// This component represents a button for downloading content
const DownloadButton = ({ rowData }) => {
    // Accessing the user context to use user-related information
    const { user } = useContext(UserContext);

    // Handler function for the download action
    const handleDownload = async () => {
        try {
            // Get the folder ID from the rowData
            const folder = rowData._id?.toHexString();

            // Refresh the user's access token
            await user.refreshAccessToken();
            // Retrieve the access token
            const token = await user.accessToken;

            // Make a POST request to the server to download the folder
            const response = await axios.post(`${process.env.REACT_APP_DIGITAL_OCEAN_URL}download_folder/`, { folder, token }, {
                responseType: 'blob', // Set response type as blob for binary data
            });

            // Create a Blob from the response data
            const file = new Blob([response.data], {
                type: 'application/zip', // Set file type as ZIP
            });

            // Create a URL for the blob
            const fileURL = URL.createObjectURL(file);

            // Open the URL in a new window to start the download
            window.open(fileURL);
        } catch (error) {
            // Log any errors that occur during download
            console.error("Error downloading the file:", error);
        }
    };

    // Render the download button with an icon
    return <Button icon="pi pi-folder-open" rounded outlined className="ml-2" onClick={handleDownload} />;
};

export default DownloadButton;
