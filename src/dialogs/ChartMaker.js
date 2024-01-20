import React, { useState } from 'react';
import { Dialog } from 'primereact/dialog';
import Plot from 'react-plotly.js';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import {Button} from "primereact/button";
export function ChartMaker(){
    const [visible, setVisible] = useState(false);

    const toggleDialog = () => {
        setVisible(!visible);
    }

    const data = [{
        type: 'scatter',
        x: [1, 2, 3, 4],
        y: [10, 15, 13, 17],
        mode: 'markers',
        marker: { color: 'red' },
    }];

    const layout = {
        title: 'My Plot',
        xaxis: {
            title: 'X Axis Label',
        },
        yaxis: {
            title: 'Y Axis Label',
        },
    };

    return (
        <div>
            <Button icon="pi pi-chart-bar" label="Show Chart" onClick={toggleDialog} />
            <Dialog header="Chart" visible={visible} modal onHide={toggleDialog}>
                <Plot data={data} layout={layout} />
            </Dialog>
        </div>
    );
}