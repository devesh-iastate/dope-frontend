import React, { useEffect, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import Plot from 'react-plotly.js';
import axios from 'axios';
import Papa from 'papaparse';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import {Button} from "primereact/button";

// Component for loading and visualizing CSV data in a Plotly chart
export function CsvDialogButton({ link_function, file_name, experiment_name, experiment_type }) {
    const [visible, setVisible] = useState(false); // State for dialog visibility
    const [data, setData] = useState(null); // State for storing CSV data
    const [new_url, setNewUrl] = useState(null); // State for storing the URL of the CSV file

    // Effect for fetching the URL of the CSV file on component mount
    useEffect(() => {
        const getData = async () => {
            // Fetch URL using the provided link_function and file_name
            const url = await link_function(file_name);
            setNewUrl(url); // Store the fetched URL
        }
        getData();
    }, []);

    // Async function to load CSV data
    const loadCsvData = async () => {
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: new_url,  // Using the URL from state
            headers: {},
        };
        try {
            // Fetching the CSV data using axios
            const response = await axios.request(config);
            const csvData = response.data;

            // Parse CSV data using PapaParse
            Papa.parse(csvData, {
                header: false, // Assuming no header row, adjust if needed
                dynamicTyping: true, // Automatically converts numeric fields to numbers
                complete: (result) => {
                    // Update state with parsed CSV data
                    setData(result.data);
                },
            });

        } catch (error) {
            // Error handling for failed CSV data fetch
            console.error('Error fetching CSV data:', error);
        }
    };

    // Function to hide the dialog
    const onHide = () => setVisible(false);

    // Footer for the dialog
    const dialogFooter = (
        <button onClick={onHide}>Close</button>
    );

    // Preparing data structure for Plotly
    const plotData = [
        {
            type: 'scatter',  // Assuming scatter plot, adjust type if necessary
            x: data ? data.map(row => row[0]) : [], // X-axis data
            y: data ? data.map(row => row[1]) : [], // Y-axis data
            mode: 'markers', // Plot mode
        },
    ];

    return (
        <div>
            {/* Button to load and plot CSV data */}
            <div className='csv-button'>
                <Button label='Plot' onClick={() => { setVisible(true); loadCsvData(); }}/>
            </div>
            <Dialog
                header={"Experiment type : " + experiment_type}
                visible={visible}
                onHide={onHide}
                footer={dialogFooter}>
                {/* Plot component for visualizing CSV data */}
                <Plot data={plotData} layout={{ title: experiment_name }}/>
            </Dialog>
        </div>
    );
}
