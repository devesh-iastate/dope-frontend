import {Button} from "primereact/button";
import React, {useContext, useEffect, useRef, useState} from "react";
import {Dialog} from "primereact/dialog";
import {InputText} from "primereact/inputtext";
import {UserContext} from "../contexts/user.context";
import {Toast} from "primereact/toast";
import {classNames} from "primereact/utils";
import {Calendar} from "primereact/calendar";

export function DataForm(){
    // Initial empty product structure
    let emptyProduct = {
        experiment_name: '',
        experiment_dt: null,
        experiment_location: '',
        polymer_name: '',
        polymer_mw: '',
        polymer_rr: '',
        polymer_batch: '',
        polymer_company: '',
        solvent: '',
        dopant_name: '',
        dopant_batch: '',
        dopant_company: '',
        loading_polymer: '',
        loading_dopant: '',
        loading_solvent: '',
        temperature: '',
        print_speed: '',
        print_voltage: '',
        print_head_diameter: '',
        substrate_name: '',
        substrate_company: '',
        annealing_temperature: '',
        annealing_duration: '',
        fab_box: '',
        fab_humidity: '',
        other: '',
        uv_vis_nir_files : [],
        iv_files : [],
        profilometry_files : [],
        giwaxs_files : [],
        skpm_files : [],
        solvents: [{ name: '', value: '' }],
        "thickness": [
            {
              "batch": "Please enter batch number",
              "reading": "Please enter reading",
              "who": "Please enter your group name"
            }
          ],
          "uv_vis_nir": [
            {
              "batch": "Please enter batch number",
              "reading": "Please enter reading",
              "who": "Please enter your group name",
              "file": "Please enter file name"
            }
          ],
          "giwaxs": [
            {
              "batch": "Please enter batch number",
              "reading": "Please enter reading",
              "who": "Please enter your group name",
              "filetype": "1D or 2D",
              "file": "Please enter file name"
            }
          ],
          "skpm": [
            {
              "batch": "Please enter batch number",
              "reading": "Please enter reading",
              "who": "Please enter your group name",
              "file": "Please enter file name"
            }
          ],
          "iv": [
            {
              "batch": "Please enter batch number",
              "reading": "Please enter reading",
              "who": "Please enter your group name",
              "file": "Please enter file name"
            }
          ],
          "profilometry": [
            {
              "batch": "Please enter batch number",
              "reading": "Please enter reading",
              "who": "Please enter your group name",
              "file": "Please enter file name"
            }
          ],
          "conductivity": [
            {
              "batch": "Please enter batch number",
              "reading": "Please enter reading",
              "who": "Please enter your group name"
            }
          ]
    };

    // State and context hooks
    const {user} = useContext(UserContext);
    const [submitted, setSubmitted] = useState(false);
    const [productDialog, setProductDialog] = useState(false);
    const toast = useRef(null);
    const [product, setProduct] = useState(emptyProduct);

    // Open the product dialog
    const openNew = () => {
        setProduct(emptyProduct);
        setSubmitted(false);
        setProductDialog(true);
    };

    // Save product information
    const saveProduct = async () => {
        setSubmitted(true);
        if (product.polymer_name.trim()) {
            let _product = {...product};
            const functionName = "putProductInfo";
            const args = [_product];
            let result = await user.callFunction(functionName, ...args);
            result = JSON.parse(JSON.stringify(result));
            _product.id = result['insertedId'];
            toast.current.show({severity: 'success', summary: 'Successful', detail: 'Product Created', life: 3000});
            setProductDialog(false);
            setProduct(emptyProduct);
        }
    };

    // Dialog footer with action buttons
    const productDialogFooter = (
        <React.Fragment>
            <Button label="Cancel" icon="pi pi-times" outlined onClick={hideProductDialog} />
            <Button label="Save" icon="pi pi-check" onClick={saveProduct} />
        </React.Fragment>
    );

    // Handle input change
    const onInputChange = (e, name) => {
        const val = (e.target && e.target.value) || '';
        let _product = { ...product };

        _product[`${name}`] = val;

        setProduct(_product);
    };

    // Hide product dialog
    function hideProductDialog() {
        setSubmitted(false);
        setProductDialog(false);
    }

    // Handle solvent changes
    const handleSolventChange = (e, index, field) => {
        const newSolvents = [...product.solvents];
        newSolvents[index][field] = e.target.value;
        setProduct({ ...product, solvents: newSolvents });
    };

    // Add a new solvent field
    const addSolvent = () => {
        setProduct({
            ...product,
            solvents: [...product.solvents, { name: '', value: '' }],
        });
    };

    // Remove a solvent field
    const removeSolvent = (index) => {
        const newSolvents = [...product.solvents];
        newSolvents.splice(index, 1);
        setProduct({ ...product, solvents: newSolvents });
    };

    // Component rendering
    return(

        <div>
            <Toast ref={toast} />
            <Button label="New" icon="pi pi-plus" severity="success" onClick={openNew} />
            <Dialog visible={productDialog} style={{ width: '64rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="" modal className="p-fluid" footer={productDialogFooter} onHide={hideProductDialog}>
                <div className="head">
                    <h1 className="h"> METADATA </h1>
                </div>
                <div className="font-bold underline">
                    Experiment Info:
                </div>
                <div className="container">
                    <div className="container">
                        <label htmlFor="experiment_name" className="text" >
                            Name
                        </label>
                        <InputText className="textbox" id="experiment_name" value={product.experiment_name} onChange={(e) => onInputChange(e, 'experiment_name')}  />
                    </div>
                
                    <div className="container">
                        <label htmlFor="experiment_dt" className="text">
                           Date/Time <font color="red">*</font>
                        </label>
                        <Calendar className="textbox" value={product.experiment_dt} onChange={(e) => onInputChange(e, 'experiment_dt')} showTime hourFormat="24" />
                        {submitted && !product.experiment_dt && <small className="p-error">Date and time are required.</small>}
                    </div>
                    <div className="container">
                        <label htmlFor="experiment_location" className="text">
                            Lab
                        </label>
                        <InputText className="textbox" id="experiment_location" value={product.experiment_location} onChange={(e) => onInputChange(e, 'experiment_location')}  />
                    </div>
                </div>
                <div className="font-bold underline">
                    Polymer Info:
                </div>
                <div className="container">
                    <div className="container">
                        <label htmlFor="polymer_name" className="text">
                            Name<font color="red">*</font>
                        </label>
                        <InputText className="textbox" id="polymer_name" value={product.polymer_name} onChange={(e) => onInputChange(e, 'polymer_name')}    />
                        {submitted && !product.polymer_name && <small className="p-error">Polymer name is required.</small>}
                    </div>

                    <div className="container">
                        <label htmlFor="polymer_mw" className="text">
                            MW
                        </label>
                        <InputText className="textbox" id="polymer_mw" value={product.polymer_mw} onChange={(e) => onInputChange(e, 'polymer_mw')}   />
                    </div>

                    <div className="container">
                        <label htmlFor="polymer_rr" className="text">
                            RR
                        </label>
                        <InputText className="textbox" id="polymer_rr" value={product.polymer_rr} onChange={(e) => onInputChange(e, 'polymer_rr')}   />
                    </div>
                </div>
                {/* <div className="field">
                    <label htmlFor="polymer_mw" className="font-bold">
                        MW
                    </label>
                    <InputText id="polymer_mw" value={product.polymer_mw} onChange={(e) => onInputChange(e, 'polymer_mw')}   />
                </div>
                <div className="field">
                    <label htmlFor="polymer_rr" className="font-bold">
                        RR
                    </label>
                    <InputText id="polymer_rr" value={product.polymer_rr} onChange={(e) => onInputChange(e, 'polymer_rr')}   />
                </div>
                <div className="field">
                    <label htmlFor="polymer_batch" className="font-bold">
                        Batch
                    </label>
                    <InputText id="polymer_batch" value={product.polymer_batch} onChange={(e) => onInputChange(e, 'polymer_batch')}  />
                </div>
                <div className="field">
                    <label htmlFor="polymer_company" className="font-bold">
                        Company
                    </label>
                    <InputText id="polymer_company" value={product.polymer_company} onChange={(e) => onInputChange(e, 'polymer_company')}  />
                </div> */}
                
                <div className="field">
                    <label htmlFor="solvent" className="font-bold underline">
                        Solvent/co-solvent info :
                    </label>
                    <div className="container">
                        {product.solvents.map((solvent, index) => (
                            <div key={index}>
                                <InputText
                                className="textbox"
                                    placeholder="Solvent Name"
                                    value={solvent.name}
                                    onChange={(e) => handleSolventChange(e, index, 'name')}
                                />
                                <InputText
                                className="textbox"
                                    placeholder="Solvent Value"
                                    value={solvent.value}
                                    onChange={(e) => handleSolventChange(e, index, 'value')}
                                />
                                {product.solvents.length > 1 && (
                                    <Button
                                        label="Remove"
                                        onClick={() => removeSolvent(index)}
                                    />
                                )}
                            </div>
                        ))}
                        <Button label="Add Solvent" onClick={addSolvent} />
                    </div>
                </div>
                <div className="font-bold underline">
                    Dopant Info:
                </div>
                <div className="container">
                    <div className="container">
                        <label htmlFor="dopant_name" className="text">
                            Name
                        </label>
                        <InputText className="textbox" id="dopant_name" value={product.dopant_name} onChange={(e) => onInputChange(e, 'dopant_name')}  />
                    </div>
                    <div className="container">
                        <label htmlFor="dopant_batch" className="text">
                            Batch
                        </label>
                        <InputText className="textbox" id="dopant_batch" value={product.dopant_batch} onChange={(e) => onInputChange(e, 'dopant_batch')}  />
                    </div>
                    <div className="container">
                        <label htmlFor="dopant_company" className="text">
                            Company
                        </label>
                        <InputText className="textbox" id="dopant_company" value={product.dopant_company} onChange={(e) => onInputChange(e, 'dopant_company')}  />
                    </div>
                </div>
                <div className="font-bold underline">
                    Loading Info:
                </div>
                <div className="container">
                    <div className="container">
                        <label htmlFor="loading_polymer" className="text">
                            Polymer amount
                        </label>
                        <InputText className="textbox" id="loading_polymer" value={product.loading_polymer} onChange={(e) => onInputChange(e, 'loading_polymer')}  />
                    </div>
                    <div className="container">
                        <label htmlFor="loading_dopant" className="text">
                            Dopant amount
                        </label>
                        <InputText className="textbox" id="loading_dopant" value={product.loading_dopant} onChange={(e) => onInputChange(e, 'loading_dopant')}  />
                    </div>
                </div>
                <div className="container">
                    <div className="container">
                        <label htmlFor="loading_solvent" className="text">
                            Solvent / Co-solvent mic ect
                        </label>
                        <InputText className="textbox" id="loading_solvent" value={product.loading_solvent} onChange={(e) => onInputChange(e, 'loading_solvent')}  />
                    </div>
                    <div className="container">
                        <label htmlFor="temperature" className="text">
                            Temperature (C):
                        </label>
                        <InputText className="textbox" id="temperature" value={product.temperature} onChange={(e) => onInputChange(e, 'temperature')}  />
                    </div>
                </div>
                <div className="font-bold underline">
                    Print Info:
                </div>
                <div className="container">
                    <div className="container">
                        <label htmlFor="print_speed" className="text">
                            Print Speed
                        </label>
                        <InputText className="textbox" id="print_speed" value={product.print_speed} onChange={(e) => onInputChange(e, 'print_speed')}  />
                    </div>
                    <div className="container">
                        <label htmlFor="print_voltage" className="text">
                            Print Voltage
                        </label>
                        <InputText className="textbox" id="print_voltage" value={product.print_voltage} onChange={(e) => onInputChange(e, 'print_voltage')}  />
                    </div>
                    <div className="container">
                        <label htmlFor="print_head_diameter" className="text">
                            Print Head diameter
                        </label>
                        <InputText className="textbox" id="print_head_diameter" value={product.print_head_diameter} onChange={(e) => onInputChange(e, 'print_head_diameter')}  />
                    </div>
                </div>
                <div className="font-bold underline">
                    Substrate Info:
                </div>
                <div className="container">
                    <div className="container">
                        <label htmlFor="substrate_name" className="text">
                            Name
                        </label>
                        <InputText className="textbox" id="substrate_name" value={product.substrate_name} onChange={(e) => onInputChange(e, 'substrate_name')}  />
                    </div>
                    <div className="container">
                        <label htmlFor="substrate_company" className="text">
                            Company
                        </label>
                        <InputText className="textbox" id="substrate_company" value={product.substrate_company} onChange={(e) => onInputChange(e, 'substrate_company')}  />
                    </div>
                </div>
                <div className="font-bold underline">
                    Annealing Info:
                </div>
                <div className="container">
                    <div className="container">
                        <label htmlFor="annealing_temperature" className="text">
                            Temperature (C) :
                        </label>
                        <InputText className= "textbox" id="annealing_temperature" value={product.annealing_temperature} onChange={(e) => onInputChange(e, 'annealing_temperature')}  />
                    </div>
                    <div className="container">
                        <label htmlFor="annealing_duration" className="text">
                            Duration (mins) :
                        </label>
                        <InputText className="textbox" id="annealing_duration" value={product.annealing_duration} onChange={(e) => onInputChange(e, 'annealing_duration')}  />
                    </div>
                </div>
                <div className="font-bold underline">
                    Fab environment :
                </div>
                <div className="container">
                    <div className="container">
                        <label htmlFor="fab_box" className="text">
                            Air/ glove box
                        </label>
                        <InputText className="textbox" id="fab_box" value={product.fab_box} onChange={(e) => onInputChange(e, 'fab_box')}  />
                    </div>
                    <div className="container">
                        <label htmlFor="fab_humidity" className="text">
                            Humidity
                        </label>
                        <InputText className="textbox" id="fab_humidity" value={product.fab_humidity} onChange={(e) => onInputChange(e, 'fab_humidity')}  />
                    </div>
                </div>
            </Dialog>
        </div>
    );
}