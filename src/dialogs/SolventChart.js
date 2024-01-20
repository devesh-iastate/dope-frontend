import React, {useState, useEffect, useContext} from 'react';
import Plot from 'react-plotly.js';
import { Dialog } from 'primereact/dialog';
import {UserContext} from "../contexts/user.context";
import {Button} from "primereact/button";
import {UpdateProductInfo} from "./Form.dialog";
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';

// Component to visualize data using a Plotly chart with interactive filtering.

const MyPlotlyComponent = () => {
    // State hooks for various functionalities
    const [plotData, setPlotData] = useState([]);
    const [showDialog, setShowDialog] = useState(false);
    const { user} = useContext(UserContext);
    const [rowData, setRowData] = useState(null);
    // State for filter inputs
    const [annealingTempFilter, setAnnealingTempFilter] = useState('');
    const [conductivityFilter, setConductivityFilter] = useState('');
    // State for filter conditions (equals, greater than, less than)
    const [annealingTempCondition, setAnnealingTempCondition] = useState('equals');
    const [conductivityCondition, setConductivityCondition] = useState('equals');

    // useEffect to fetch data when filter values change
    useEffect(() => {
        fetchData();
    }, [annealingTempFilter, conductivityFilter]);

    // Async function to fetch data based on current filter settings
    const fetchData = async () => {
        const functionName = "solvent_comp";
        // Fetch data using a backend function, passing current filter values
        const response = await user.callFunction(functionName, { // Pass filter values to your backend function
            annealingTemperature: annealingTempFilter,
            conductivity: conductivityFilter
        });
        // Process and update state with the fetched data
        processAndSetData(response);
    };

    // Options for the filter condition dropdowns
    const conditionOptions = [
        { label: 'Equals', value: 'equals' },
        { label: 'Greater Than', value: 'greater' },
        { label: 'Less Than', value: 'less' }
    ];

    // Function to apply the selected filter condition to the data
    const applyFilterCondition = (value, filterValue, condition) => {
        switch (condition) {
            case 'greater':
                return value > filterValue;
            case 'less':
                return value < filterValue;
            case 'equals':
            default:
                return value === filterValue;
        }
    };

    // useEffect for initial data fetch on component mount
    useEffect(() => {
        // Redefined fetchData within useEffect to avoid dependencies on external fetchData
        const fetchData = async () => {
            const functionName = "solvent_comp";
            // Fetch data without filters initially
            const response = await user.callFunction(functionName);
            // Process and set data for the chart
            processAndSetData(response);
        };
        fetchData();
    }, []);

    // Function to process data fetched from the backend
    const processAndSetData = (data) => {
        // Parse filter values for numerical comparison
        const annealingTempFilterValue = annealingTempFilter ? parseFloat(annealingTempFilter) : null;
        const conductivityFilterValue = conductivityFilter ? parseFloat(conductivityFilter) : null;

        // Filter and map data for plotting
        const processedData = data
            .filter(item => {
                return (!annealingTempFilterValue || applyFilterCondition(item.annealing_temperature, annealingTempFilterValue, annealingTempCondition))
                    && (!conductivityFilterValue || applyFilterCondition(item.conductivity_format, conductivityFilterValue, conductivityCondition));
            })
            .map(item => ({
                type: 'scatterternary',
                mode: 'markers',
                // Mapping and structuring data for ternary plot
                a: [parseInt(item.solvents.find(s => s.name === 'CB').value, 10)],
                b: [parseInt(item.solvents.find(s => s.name === 'oDCB').value, 10)],
                c: [parseInt(item.solvents.find(s => s.name === 'Tol').value, 10)],
                // Plot point text with data details
                text: [`ID: ${item._id} Conductivity: ${item.conductivity_format} Annealing temperature: ${item.annealing_temperature}`],
                marker: {
                size: 10,
                // Customize marker properties if needed
                colorScale: 'Viridis'
            }
        }));
        // Update state with processed data for rendering in the plot
        setPlotData(processedData);
    };

    // Layout configuration for the Plotly chart
    const layout = {
        ternary: {
            sum: 100,
            aaxis: { title: "Solvent-CB" },
            baxis: { title: "Solvent-oDCB" },
            caxis: { title: "Solvent-Tol" }
        },
        width: 500,
        height: 500
    };

    // Handler for click events on the plot
    const onPlotClick = async (event) => {
        // Check if a plot point is clicked
        if (event.points && event.points.length > 0){
            const point = event.points[0];
            // Extracting ID or key information from the plot point
            const filterText = point.text.split(" ")[1];
            try {
                // Calling backend function with the extracted ID/key
                const functionName = "getProductIdInfo";
                const productInfo = await user.callFunction(functionName, filterText);
                // Update state with information about the clicked plot point
                setRowData(productInfo[0]);
                // Handle the response, e.g., set state, show dialog, etc.
            } catch (error) {
                // Logging errors in case of a failed backend call
                console.error('Error calling MongoDB function:', error);
            }
        }
    }
    return (
        <>
            {/* Button to show the Plotly chart dialog */}
            <Button label="Show Chart" onClick={() => setShowDialog(true)} />
            {/* Dialog for the Plotly chart and filtering options */}
            <Dialog header="Conductivity Analysis" visible={showDialog} onHide={() => setShowDialog(false)}>
                <div>
                    {/* Input fields and dropdowns for filtering the data */}
                    <span>Annealing Temperature: </span>
                    <InputText value={annealingTempFilter} onChange={(e) => setAnnealingTempFilter(e.target.value)} />
                    <Dropdown value={annealingTempCondition} options={conditionOptions} onChange={(e) => setAnnealingTempCondition(e.value)} />
                    <span>Conductivity: </span>
                    <InputText value={conductivityFilter} onChange={(e) => setConductivityFilter(e.target.value)} />
                    <Dropdown value={conductivityCondition} options={conditionOptions} onChange={(e) => setConductivityCondition(e.value)} />
                    {/* Button to apply the selected filters */}
                    <Button label="Apply Filters" onClick={fetchData} />
                </div>
                {/* Plotly chart rendering with plotData and layout configurations */}
                <Plot
                    data={plotData}
                    layout={layout}
                    onClick={onPlotClick}
                />
                {/* Display additional product information if available */}
                {rowData && <UpdateProductInfo rowData={rowData} label={"View more info"} icon={""}/>}
            </Dialog>

        </>
    );
};

export default MyPlotlyComponent;
