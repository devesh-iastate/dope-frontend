import {Button} from "primereact/button";
import React, {useContext, useEffect, useRef, useState} from "react";
import {Dialog} from "primereact/dialog";
import {InputTextarea} from "primereact/inputtextarea";
import {TabPanel, TabView} from "primereact/tabview";
import {UserContext} from "../contexts/user.context";
import {Toast} from "primereact/toast";
import {Calendar} from "primereact/calendar";
import {InputText} from "primereact/inputtext";
import UploadComponent from "./FIleUpload/UploadComponent";
import {v4} from "uuid";
import axios from 'axios';
import {CsvDialogButton} from "./CsvDialogButton";

// Predefined file types
const allTypes = [   "uv_vis_nir_files" ,
    "iv_files" ,
    "profilometry_files" ,
    "giwaxs_files" ,
    "skpm_files" ]

export function UpdateProductInfo({rowData, label, icon}) {


    let emptyProduct = {
        polymerInfo: ''
    }

    const [showProductInfo, setShowProductInfo] = useState(false);
    const [formData, setFormData] = useState( null);
    const [fileNames, setFileNames] = useState({});//[...rowData?.uv_vis_nir_files, ...rowData?.iv_files, ...rowData?.profilometry_files, ...rowData?.giwaxs_files, ...rowData?.skpm_files] || [
    const [imageNames, setImageNames] = useState([])  ;
    const [submitted, setSubmitted] = useState(false);
    const toast = useRef(null);
    const { user} = useContext(UserContext);
    const [file, setFile] = useState(null);

    // Function to set files based on type
    const functionToSetFiles = ( acceptedFiles, type) => {

        // const typeValues = file?.[type] || [];
        // typeValues.push(...acceptedFiles);
        setFile(prev => (
            { ...prev, [type] : [ ...acceptedFiles ] }
        ))
    }

    //Logging Utility for data
    const logData = () => {
        console.log(formData?.thickness[0].batch)
        console.log(formData?.thickness[0].reading)
        console.log(formData?.thickness[0].who)
    }

    // Upload file function
    const uploadFile = async (fileTypeVal) => {
        try {
            // for ( let j=0; j<allTypes.length; j++) {
            //     let typeVal = allTypes[j];
            // // }
            let newImageNames = {}
            const typeVal = fileTypeVal
            if (file?.[typeVal]?.length === 0 || !file?.[typeVal]) return [];
            let promiseArr = [];
            const newFileAddedTypeWise = []
            for (let i = 0; i < file?.[typeVal]?.length || 0; i++) {
                const fileVal = file?.[typeVal]?.[i]
                const uuidVal = v4() + '_' + file?.[typeVal]?.[i].name
                // const imageRef = ref(storage, `images/${uuidVal}`);
                // let uploadPromise = await uploadBytes(imageRef, fileVal)
                const form = new FormData();
                const url = process.env.REACT_APP_DIGITAL_OCEAN_URL + 'upload_file/';
                await user.refreshAccessToken();
                const userToken = await user.accessToken;
                form.append('file', fileVal, uuidVal);
                form.append('token', userToken);
                form.append('folder', formData?._id.toHexString());
                //newFileAddedTypeWise.push(uuidVal);
                try{
                    const response = await axios.post(url, form, {
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'multipart/form-data',
                        },
                    });
                    // debugger
                    // newFileAddedTypeWise.push({url : response?.data?.url, name : uuidVal});
                    newFileAddedTypeWise.push({name : uuidVal});

                } catch (error) {
                    console.error('Error during file upload: ', error);
                    return false;
                }
                // promiseArr.push(uploadPromise);
            }
            const prevTypeWise = imageNames[typeVal] || [];
            newImageNames = {...imageNames, [typeVal]: [...prevTypeWise, ...newFileAddedTypeWise]}
            setImageNames(prev => ({...prev, [typeVal]: [...prevTypeWise, ...newFileAddedTypeWise]}))
            // await Promise.all(promiseArr)


            return newImageNames;

        }
        catch (err){
            return false;
        }
    };

    // Initialize form data on component mount
    useEffect( ()=>{
        setFormData({
            ...rowData
        })
    },[])

    // Function to hide product info dialog
    function hideProductInfo() {
        try {
        //setFormData({});
        setShowProductInfo(false);
        } catch (err){
            console.log('error', err)
        }
    }

    // Function to show product info dialog
    const openNew = () => {
        // setProduct(emptyProduct);
        // setSubmitted(false);
        setFormData({...rowData})
        setShowProductInfo(true);

    };

    // Save product information
    const saveProduct = async (fileTypeVal) => {

        try{
            let uploadValues = await uploadFile(fileTypeVal);
            // debugger
            if(!uploadValues){
                toast.current.show({severity: 'error', summary: 'Error', detail: 'Error in uploading files', life: 3000});
                return;
            }
            const functionName = "updateProductInfo";
            let args = { ...formData }
            let typeValueObject = {}
            for( const typeVal of allTypes){
                const formTypeWise = formData?.[typeVal] || [];
                if( uploadValues?.[typeVal] === undefined || uploadValues?.[typeVal]?.url?.length === 0) continue;
                formTypeWise.push(...uploadValues?.[typeVal])
                typeValueObject = { ...typeValueObject, [typeVal] : formTypeWise}
            }
            args = { ...args, ...typeValueObject }
            //const args = {...formData,  ...uploadValues  };
            await user.callFunction(functionName, args);
            toast.current.show({severity: 'success', summary: 'Successful', detail: 'Product Info Updated', life: 3000});
            setShowProductInfo(false);
            window.location.reload(true);
        }catch (e) {
            toast.current.show({severity: 'error', summary: 'Error', detail: 'Error in updating product info', life: 3000});
        }

    }

    // Set form data value
    const setFormDataValue = (key, value) => {
        setFormData(prev => ({...prev, [key]: value}));
    }

    // Fetch download link for a file
    const fetchDownloadLink = async (filePath) => {
        try {
            filePath = formData?._id.toHexString()+'/'+filePath;
            await user.refreshAccessToken();
            const token = await user.accessToken;
            const response = await axios.post(process.env.REACT_APP_DIGITAL_OCEAN_URL+'generate_download_link/', { filePath, token }, {responseType: 'json',});
                // await fetch(process.env.REACT_APP_DIGITAL_OCEAN_URL+'generate_download_link/', {filePath, token}, {responseType: 'json',});
                // method: 'POST',
                // headers: {
                //     'Content-Type': 'application/json',
                // },
                // body: JSON.stringify({ 'file_path': filePath, 'token': token }),
            // });

            const data = await response.data;
            if (data.url) {
                return data.url;
            } else {
                throw new Error(data.error || 'Failed to fetch download link');
            }
        } catch (error) {
            console.error('Error fetching download link:', error);
        }
    };

    // Handler for file name click
    const handleFileNameClick = async (filePath, event) => {
        event.preventDefault();
        const downloadLink = await fetchDownloadLink(filePath);

        if (downloadLink) {
            window.location.href = downloadLink;
        }
    };

     // Handle thickness changes
     const handleThicknessChange = (e, index, field) => {
        const newThickness = [...formData.thickness];
        if(field === 'batch'){
        newThickness[index].batch = e.target.value;
        }

        if(field === 'reading'){
            newThickness[index].reading = e.target.value;
            }

        if(field === 'who'){
                newThickness[index].who = e.target.value;
                }

        setFormData({ ...formData, thickness: newThickness });
    };

    const addThickness = () => {
        setFormData({
            ...formData,
            thickness: [...formData.thickness, { batch: '', reading: '', who: '' }],
        });
    };

    // Handle conductivity changes
    const handleConductivityChange = (e, index, field) => {
        const newConductivity = [...formData.conductivity];
        if(field === 'batch'){
        newConductivity[index].batch = e.target.value;
        }

        if(field === 'reading'){
            newConductivity[index].reading = e.target.value;
            }

        if(field === 'who'){
                newConductivity[index].who = e.target.value;
                }

        setFormData({ ...formData, conductivity: newConductivity });
    };


    // Add a new conductivity field
    const addConductivity = () => {
        setFormData({
            ...formData,
            conductivity: [...formData.conductivity, { batch: '', reading: '', who: '' }],
        });
    };

     // Handle UVVISNIR changes
     const handleUVVISNIRChange = (e, index, field) => {
        const newUVVISNIR = [...formData.uv_vis_nir];

        if(field === 'batch'){
            newUVVISNIR[index].batch = e.target.value;
            }

        if(field === 'reading'){
            newUVVISNIR[index].reading = e.target.value;
            }

        if(field === 'who'){
            newUVVISNIR[index].who = e.target.value;
            }
        if(field === 'file'){
                newUVVISNIR[index].file = e.target.value;
            }

        setFormData({ ...formData, uv_vis_nir: newUVVISNIR });
    };

    // Add a new UVVISNIR field
    const addUVVISNIR = () => {
        setFormData({
            ...formData,
            uv_vis_nir: [...formData.uv_vis_nir, { batch: '', reading: '', who: '', file: '' }],
        });
    };

    // Handle IV changes
    const handleIVChange = (e, index, field) => {
        const newIV = [...formData.iv];

        if(field === 'batch'){
            newIV[index].batch = e.target.value;
            }

        if(field === 'reading'){
            newIV[index].reading = e.target.value;
            }

        if(field === 'who'){
            newIV[index].who = e.target.value;
            }
        if(field === 'file'){
                newIV[index].file = e.target.value;
            }

        setFormData({ ...formData, iv: newIV });
    };

    // Add a new IV field
    const addIV = () => {
        setFormData({
            ...formData,
            iv: [...formData.iv, { batch: '', reading: '', who: '', file: '' }],
        });
    };


     // Handle Profilometry changes
     const handleProfilometryChange = (e, index, field) => {
        const newProfilometry = [...formData.profilometry];

        if(field === 'batch'){
            newProfilometry[index].batch = e.target.value;
            }

        if(field === 'reading'){
            newProfilometry[index].reading = e.target.value;
            }

        if(field === 'who'){
            newProfilometry[index].who = e.target.value;
            }
        if(field === 'file'){
                newProfilometry[index].file = e.target.value;
            }

        setFormData({ ...formData, profilometry: newProfilometry });
    };

    // Add a new Profilometry field
    const addProfilometry = () => {
        setFormData({
            ...formData,
            profilometry: [...formData.profilometry, { batch: '', reading: '', who: '', file: '' }],
        });
    };


     // Handle SKPM changes
     const handleSKPMChange = (e, index, field) => {
        const newSKPM = [...formData.skpm];

        if(field === 'batch'){
            newSKPM[index].batch = e.target.value;
            }

        if(field === 'reading'){
            newSKPM[index].reading = e.target.value;
            }

        if(field === 'who'){
            newSKPM[index].who = e.target.value;
            }
        if(field === 'file'){
                newSKPM[index].file = e.target.value;
            }

        setFormData({ ...formData, skpm: newSKPM });
    };

    // Add a new SKPM field
    const addSKPM = () => {
        setFormData({
            ...formData,
            skpm: [...formData.skpm, { batch: '', reading: '', who: '', file: '' }],
        });
    };


     // Handle SKPM changes
     const handleGIWAXSChange = (e, index, field) => {
        const newGIWAXS = [...formData.giwaxs];

        if(field === 'batch'){
            newGIWAXS[index].batch = e.target.value;
            }

        if(field === 'reading'){
            newGIWAXS[index].reading = e.target.value;
            }

        if(field === 'who'){
            newGIWAXS[index].who = e.target.value;
            }

        if(field === 'filetype'){
            newGIWAXS[index].filetype = e.target.value;
        }
        if(field === 'file'){
                newGIWAXS[index].file = e.target.value;
            }

        setFormData({ ...formData, giwaxs: newGIWAXS });
    };

    // Add a new GIWAXS field
    const addGIWAXS = () => {
        setFormData({
            ...formData,
            giwaxs: [...formData.giwaxs, { batch: '', reading: '', who: '', filetype: '', file: '' }],
        });
    };


    return(
        <div>
            <Toast ref={toast} />
            <Button icon={icon} label={label} rounded outlined className="mr-2" onClick={openNew} />
            <Dialog visible={showProductInfo} style={{ width: '100vw' }} onHide={hideProductInfo} header="">
            <div className="head">
                    <h1 className="h"> READINGS AND FILES </h1>
                </div>
                <TabView scrollable>
                    <TabPanel header="Metadata">
                        <div>
                            <font color="red">Originally created Metadata for an experiment cannot be changed after the fact!</font>
                            <div className="font-bold underline">
                                Experiment Info:
                            </div>
                            <div className="field">
                                <label htmlFor="experiment_name" className="font-bold">
                                    Experiment Name
                                </label><br />
                                <InputText id="experiment_name" value={formData?.experiment_name}  />
                            </div>
                            <div className="field">
                                <label htmlFor="experiment_dt" className="font-bold">
                                    Date and time of experiment
                                </label><br />
                                <Calendar value={formData?.experiment_dt}  showTime hourFormat="24" />
                            </div>
                            <div className="field">
                                <label htmlFor="experiment_location" className="font-bold">
                                    Location
                                </label><br />
                                <InputText id="experiment_location" value={formData?.experiment_location}  />
                            </div>
                            <div className="font-bold underline">
                                Polymer Info:
                            </div>
                            <div className="field">
                                <label htmlFor="polymer_name" className="font-bold">
                                    Name
                                </label><br />
                                <InputText id="polymer_name" value={formData?.polymer_name}    />
                            </div>
                            <div className="field">
                                <label htmlFor="polymer_mw" className="font-bold">
                                    MW
                                </label><br />
                                <InputText id="polymer_mw" value={formData?.polymer_mw}   />
                            </div>
                            <div className="field">
                                <label htmlFor="polymer_rr" className="font-bold">
                                    RR
                                </label><br />
                                <InputText id="polymer_rr" value={formData?.polymer_rr}   />
                            </div>
                            <div className="field">
                                <label htmlFor="polymer_batch" className="font-bold">
                                    Batch
                                </label><br />
                                <InputText id="polymer_batch" value={formData?.polymer_batch}   />
                            </div>
                            <div className="field">
                                <label htmlFor="polymer_company" className="font-bold">
                                    Company
                                </label><br />
                                <InputText id="polymer_company" value={formData?.polymer_company}  />
                            </div>
                            <div className="field">
                                <label htmlFor="solvent" className="font-bold underline">
                                    Solvent/co-solvent info :
                                </label><br />
                                {formData?.solvents?.map((solvent, index) => (
                                    <div key={index}>
                                        <label>Name:</label>
                                        <InputText value={solvent.name} readOnly />
                                        <label>Value:</label>
                                        <InputText value={solvent.value} readOnly />
                                    </div>
                                ))}

                            </div>
                            <div className="font-bold underline">
                                Dopant Info:
                            </div>
                            <div className="field">
                                <label htmlFor="dopant_name" className="font-bold">
                                    Name
                                </label><br />
                                <InputText id="dopant_name" value={formData?.dopant_name}   />
                            </div>
                            <div className="field">
                                <label htmlFor="dopant_batch" className="font-bold">
                                    Batch
                                </label><br />
                                <InputText id="dopant_batch" value={formData?.dopant_batch}  />
                            </div>
                            <div className="field">
                                <label htmlFor="dopant_company" className="font-bold">
                                    Company
                                </label><br />
                                <InputText id="dopant_company" value={formData?.dopant_company} />
                            </div>
                            <div className="font-bold underline">
                                Loading Info:
                            </div>
                            <div className="field">
                                <label htmlFor="loading_polymer" className="font-bold">
                                    Polymer amount
                                </label><br />
                                <InputText id="loading_polymer" value={formData?.loading_polymer} />
                            </div>
                            <div className="field">
                                <label htmlFor="loading_dopant" className="font-bold">
                                    Dopant amount
                                </label><br />
                                <InputText id="loading_dopant" value={formData?.loading_dopant}  />
                            </div>
                            <div className="field">
                                <label htmlFor="loading_solvent" className="font-bold">
                                    Solvent / Co-solvent mic ect
                                </label><br />
                                <InputText id="loading_solvent" value={formData?.loading_solvent}  />
                            </div>
                            <div className="field">
                                <label htmlFor="temperature" className="font-bold underline">
                                    Temperature (C):
                                </label><br />
                                <InputText id="temperature" value={formData?.temperature} />
                            </div>
                            <div className="font-bold underline">
                                Print Info:
                            </div>
                            <div className="field">
                                <label htmlFor="print_speed" className="font-bold">
                                    Print Speed
                                </label><br />
                                <InputText id="print_speed" value={formData?.print_speed}  />
                            </div>
                            <div className="field">
                                <label htmlFor="print_voltage" className="font-bold">
                                    Print Voltage
                                </label><br />
                                <InputText id="print_voltage" value={formData?.print_voltage}   />
                            </div>
                            <div className="field">
                                <label htmlFor="print_head_diameter" className="font-bold">
                                    Print Head diameter
                                </label><br />
                                <InputText id="print_head_diameter" value={formData?.print_head_diameter}  />
                            </div>
                            <div className="font-bold underline">
                                Substrate Info:
                            </div>
                            <div className="field">
                                <label htmlFor="substrate_name" className="font-bold">
                                    Name
                                </label><br />
                                <InputText id="substrate_name" value={formData?.substrate_name}  />
                            </div>
                            <div className="field">
                                <label htmlFor="substrate_company" className="font-bold">
                                    Company
                                </label><br />
                                <InputText id="substrate_company" value={formData?.substrate_company}  />
                            </div>
                            <div className="font-bold underline">
                                Annealing Info:
                            </div>
                            <div className="field">
                                <label htmlFor="annealing_temperature" className="font-bold">
                                    Temperature (C)
                                </label><br />
                                <InputText id="annealing_temperature" value={formData?.annealing_temperature}  />
                            </div>
                            <div className="field">
                                <label htmlFor="annealing_duration" className="font-bold">
                                    Duration (Minutes)
                                </label><br />
                                <InputText id="annealing_duration" value={formData?.annealing_duration}  />
                            </div>
                            <div className="font-bold underline">
                                Fab environment :
                            </div>
                            <div className="field">
                                <label htmlFor="fab_box" className="font-bold">
                                    Air / Glove box
                                </label><br />
                                <InputText id="fab_box" value={formData?.fab_box}   />
                            </div>
                            <div className="field">
                                <label htmlFor="fab_humidity" className="font-bold">
                                    Humidity
                                </label><br />
                                <InputText id="fab_humidity" value={formData?.fab_humidity}   />
                            </div>
                            <div className="field">
                                <label htmlFor="other" className="font-bold underline">
                                    Other info :
                                </label><br />
                                <InputText id="other" value={formData?.other}  />
                            </div>
                        </div>
                    </TabPanel>
                    <TabPanel header="Film thickness">
                        <div>
                        {formData?.thickness.map((singleThickness, idx) => (
                            <div className="container" key={idx}>
                                <div className="field">
                                    <span className="text">
                                        BatchID
                                    </span>
                                    <textarea className="textbox"  value={formData?.thickness[idx]?.batch} onChange={e=> handleThicknessChange(e, idx, 'batch')} rows={1} cols={50}/>
                                
                                    <span className="text">
                                        Reading (cm)
                                    </span>
                                    <textarea className="textbox"  value={formData?.thickness[idx]?.reading} onChange={e=> handleThicknessChange(e, idx, 'reading')} rows={1} cols={50} />
                                
                                    <span className="text">
                                        Entry Person
                                    </span>
                                    <textarea className="textbox"  value={formData?.thickness[idx]?.who} onChange={e=> handleThicknessChange(e, idx, 'who')} rows={1} cols= {50} />
                                </div>
                            </div>
                            ))}
                            <div className="button-container">
                                <div className="butt">
                                    <Button label="Add a new thickness reading" onClick={addThickness} />
                                </div>
                                <div  className="butt">
                                    <Button className="butt" label="Save Data" onClick={()=>saveProduct(allTypes[0])}  />
                                </div>
                            </div>
                            {/* <Button label="Console Log" onClick={logData} /> */}
                        </div>
                    </TabPanel>
                    <TabPanel header="UV-Vis-NIR">
                        <div>
                        {formData?.uv_vis_nir.map((singleuvvisnir, idx) => (
                            <div className="container" key={idx}>
                                <div className="field">
                                    <span className="text">
                                        BatchID
                                    </span>
                                    <textarea className="textbox"  value={formData?.uv_vis_nir[idx]?.batch} onChange={e=> handleUVVISNIRChange(e, idx, 'batch')} rows={1} cols={30}/>
                                
                                    <span className="text">
                                        Reading (cm)
                                    </span>
                                    <textarea className="textbox"  value={formData?.uv_vis_nir[idx]?.reading} onChange={e=> handleUVVISNIRChange(e, idx, 'reading')} rows={1} cols={30} />
                                
                                    <span className="text">
                                        Entry Person
                                    </span>
                                    <textarea className="textbox"  value={formData?.uv_vis_nir[idx]?.who} onChange={e=> handleUVVISNIRChange(e, idx, 'who')} rows={1} cols= {30} />

                                    <span className="text">
                                        File Name
                                    </span>
                                    <textarea className="textbox"  value={formData?.uv_vis_nir[idx]?.file} onChange={e=> handleUVVISNIRChange(e, idx, 'file')} rows={1} cols= {30} />
                                </div>
                            </div>
                            ))}
                            
                            <div className="button-container">
                                <div className="butt">
                                    <Button label="Add a new UV-VIS-NIR reading" onClick={addUVVISNIR} />
                                </div>
                               
                            </div>

                            <div>
                                <label className="text">
                                    Upload
                                </label><br/>
                                <UploadComponent setFile={functionToSetFiles} type={"uv_vis_nir_files"} />
                            </div>
                            <div>
                                <label className="text">
                                    Uploaded Files
                                </label><br/>
                                <div>
                                    {formData?.["uv_vis_nir_files"]?.map(val => 
                                    <div className="container">
                                        <a href="/" onClick={(e) => handleFileNameClick(val?.name, e)}>{val?.name}</a>
                                        {val?.name.endsWith('.csv') && (
                                            <CsvDialogButton link_function={fetchDownloadLink} file_name={val?.name} experiment_name={formData?.experiment_name} experiment_type="UV-Vis-NIR" />
                                        )}
                                    </div>
                                    )}
                                </div>
                            </div>
                          
                            <div className="button-container">
                                <div  className="butt">
                                    <Button className="butt" label="Save Data" onClick={()=>saveProduct(allTypes[0])}  />
                                </div>
                            </div>
                        </div>
                    </TabPanel>

            <TabPanel header="I-V">
            <div>
            {formData?.iv.map((singleiv, idx) => (
              <div className="container" key={idx}>
                    <div className="field">
                        <span className="text">Batch ID</span>
                        <textarea className="textbox" value={formData?.iv[idx]?.batch} onChange={(e) => handleIVChange(e,idx,'batch')} rows={1} cols={30}/>
                    
                        <span className="text">Reading</span>
                        <textarea className="textbox" value={formData?.iv[idx]?.reading} onChange={(e) => handleIVChange(e,idx,'reading')} rows={1} cols={30}/>
                        
                        <span className="text">Entry Person</span>
                        <textarea className="textbox" value={formData?.iv[idx]?.who} onChange={(e) => handleIVChange(e,idx,'who')} rows={1} cols={30}/>

                        <span className="text">File Name</span>
                        <textarea className="textbox" value={formData?.iv[idx]?.file} onChange={(e) => handleIVChange(e,idx,'file')} rows={1} cols={30}/>
                    </div>
                </div>
            ))}

            <div className="button-container">
                                <div className="butt">
                                    <Button label="Add a new IV reading" onClick={addIV} />
                                </div>
            </div>
            
              <div>
                <label className="text">Upload</label>
                <br />
                <UploadComponent
                  setFile={functionToSetFiles}
                  type={"iv_files"}
                />
              </div>

              <div>
                <label className="text">Uploaded Files</label>
                <br />
                <div>
                  {formData?.["iv_files"]?.map((val) => (
                    <div className="container">
                      <a
                        href="/"
                        onClick={(e) => handleFileNameClick(val?.name, e)}
                      >
                        {val?.name}
                      </a>
                      {val?.name.endsWith(".csv") && (
                        <CsvDialogButton
                          link_function={fetchDownloadLink}
                          file_name={val?.name}
                          experiment_name={formData?.experiment_name}
                          experiment_type="I-V"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="button-container">
                    <div  className="butt">
                        <Button className="butt" label="Save Data" onClick={()=>saveProduct(allTypes[1])}  />
                        </div>
              </div>

              {/*<Button label="Submit" onClick={saveProduct}/>*/}
              {/* <Button label="Submit" onClick={() => saveProduct(allTypes[1])} /> */}
            </div>
          </TabPanel>            
                 
                    <TabPanel header="Profilometry">
                        <div>
                        {formData?.profilometry.map((singleprofilometry, idx) => (
                            <div className="container" key={idx}> 
                                <div className="field"> 
                                    <span className="text">Batch ID</span>
                                    <textarea className="textbox" value={formData?.profilometry[idx]?.batch} onChange={(e) => handleProfilometryChange(e,idx,'batch')} rows={1} cols={30}/>
                                
                                    <span className="text">Reading</span>
                                    <textarea className="textbox" value={formData?.profilometry[idx]?.reading} onChange={(e) => handleProfilometryChange(e,idx,'reading')} rows={1} cols={30}/>
                                    
                                    <span className="text">Entry Person</span>
                                    <textarea className="textbox" value={formData?.profilometry[idx]?.who} onChange={(e) => handleProfilometryChange(e,idx,'who')} rows={1} cols={30}/>

                                    <span className="text">File Name</span>
                                    <textarea className="textbox" value={formData?.profilometry[idx]?.file} onChange={(e) => handleProfilometryChange(e,idx,'file')} rows={1} cols={30}/>
                                </div>
                            </div>
                        ))}

                        <div className="button-container">
                                <div className="butt">
                                    <Button label="Add a new Profilometry reading" onClick={addProfilometry} />
                                </div>
                        </div>

                            <div >
                                <label className="text">
                                    Upload
                                </label><br/>
                                <UploadComponent setFile={functionToSetFiles} type={"profilometry_files"} />
                            </div>
                            <div>
                                <label className="text">
                                    Uploaded Files
                                </label><br/>
                                <div>


                                    { formData?.["profilometry_files"]?.map(val => <div className="container">
                                        <a href="/" onClick={(e) => handleFileNameClick(val?.name, e)}>{val?.name}</a>
                                        {val?.name.endsWith('.csv') && (
                                            <CsvDialogButton link_function={fetchDownloadLink} file_name={val?.name} experiment_name={formData?.experiment_name} experiment_type="Profilometry" />
                                        )}
                                    </div> )}
                                </div>
                            </div>
                           
                            {/* <Button label="Submit" onClick={()=>saveProduct(allTypes[2])}/> */}
                            <div className="button-container">
                                <div  className="butt">
                                    <Button className="butt" label="Save Data" onClick={()=>saveProduct(allTypes[2])}  />
                                </div>
                            </div>
                        </div>
                    </TabPanel>
                    <TabPanel header="Conductivity (from I-V & profilometry)">
                        <div>
                            {formData?.conductivity.map((singleConductivity, idx) => (
                                 <div className="container" key={idx}> 
                                 <div className="field"> 
                                     <span className="text">Batch ID</span>
                                     <textarea className="textbox" value={formData?.conductivity[idx]?.batch} onChange={(e) => handleConductivityChange(e,idx,'batch')} rows={1} cols={30}/>
                                 
                                     <span className="text">Reading</span>
                                     <textarea className="textbox" value={formData?.conductivity[idx]?.reading} onChange={(e) => handleConductivityChange(e,idx,'reading')} rows={1} cols={30}/>
                                     
                                     <span className="text">Entry Person</span>
                                     <textarea className="textbox" value={formData?.conductivity[idx]?.who} onChange={(e) => handleConductivityChange(e,idx,'who')} rows={1} cols={30}/>
                                 </div>
                             </div>

                            ))}

                            <div className="button-container">
                                <div className="butt">
                                    <Button label="Add a new conductivity reading" onClick={addConductivity} />
                                </div>
                                <div  className="butt">
                                    <Button className="butt" label="Save Data" onClick={()=>saveProduct(allTypes[0])}  />
                                </div>
                            </div>
                        </div>
                    </TabPanel>


                    
                    <TabPanel header="GIWAXS (NSLS II)">
                        <div>
                        {formData?.giwaxs.map((singlegiwaxs, idx) => (
                            <div className="container" key={idx}>
                                 <div className="field"> 
                                    <span className="text">Batch ID</span>
                                    <textarea className="textbox" value={formData?.giwaxs[idx]?.batch} onChange={(e) => handleGIWAXSChange(e,idx,'batch')} rows={1} cols={20}/>
                                
                                    <span className="text">Reading</span>
                                    <textarea className="textbox" value={formData?.giwaxs[idx]?.reading} onChange={(e) => handleGIWAXSChange(e,idx,'reading')} rows={1} cols={20}/>
                                    
                                    <span className="text">Entry Person</span>
                                    <textarea className="textbox" value={formData?.giwaxs[idx]?.who} onChange={(e) => handleGIWAXSChange(e,idx,'who')} rows={1} cols={20}/>
                                    <span className="text">GIWAXS File Type</span>
                                    <textarea className="textbox" value={formData?.giwaxs[idx]?.filetype} onChange={(e) => handleGIWAXSChange(e,idx,'filetype')} rows={1} cols={20}/>

                                    <span className="text">File Name</span>
                                    <textarea className="textbox" value={formData?.giwaxs[idx]?.file} onChange={(e) => handleGIWAXSChange(e,idx,'file')} rows={1} cols={20}/>
                                </div>
                            
                            </div>
                            
                        ))}

                            <div className="button-container">
                                <div className="butt">
                                    <Button label="Add a new GIWAXS reading" onClick={addGIWAXS} />
                                </div>
                               
                            </div>

                            <div>
                                <label className="text">
                                    Upload
                                </label><br/>
                                <UploadComponent setFile={functionToSetFiles} type={"giwaxs_files"} />
                            </div>
                            <div>
                                <label className="text">
                                    Uploaded Files
                                </label><br/>
                                <div>

                                    { formData?.["giwaxs_files"]?.map(val => <div>
                                        <a href="/" onClick={(e) => handleFileNameClick(val?.name, e)}>{val?.name}</a>
                                        {val?.name.endsWith('.csv') && (
                                            <CsvDialogButton link_function={fetchDownloadLink} file_name={val?.name} experiment_name={formData?.experiment_name} experiment_type="GIWAXS (NSLS II)" />
                                        )}
                                    </div>) }
                                </div>
                            </div>
                            {/*<Button label="Submit" onClick={saveProduct}/>*/}
                            {/* <Button label="Submit" onClick={()=>saveProduct(allTypes[3])}/> */}
                            
                            <div className="button-container">
                                <div  className="butt">
                                    <Button className="butt" label="Save Data" onClick={()=>saveProduct(allTypes[3])}  />
                                </div>
                            </div>

                        </div>
                    </TabPanel>



                    <TabPanel header="SKPM (UW)">
                        <div>
                        {formData?.skpm.map((singleskpm, idx) => (
                            <div className="container" key={idx}>
                                  <div className="field">
                                    <span className="text">Batch ID</span>
                                    <textarea className="textbox" value={formData?.skpm[idx]?.batch} onChange={(e) => handleSKPMChange(e,idx,'batch')} rows={1} cols={30}/>
                                
                                    <span className="text">Reading</span>
                                    <textarea className="textbox" value={formData?.skpm[idx]?.reading} onChange={(e) => handleSKPMChange(e,idx,'reading')} rows={1} cols={30}/>
                                    
                                    <span className="text">Entry Person</span>
                                    <textarea className="textbox" value={formData?.skpm[idx]?.who} onChange={(e) => handleSKPMChange(e,idx,'who')} rows={1} cols={30}/>

                                    <span className="text">File Name</span>
                                    <textarea className="textbox" value={formData?.skpm[idx]?.file} onChange={(e) => handleSKPMChange(e,idx,'file')} rows={1} cols={30}/>
                                </div>
                                </div>
                                ))}

                                <div className="button-container">
                                    <div className="butt">
                                        <Button label="Add a new SKPM reading" onClick={addSKPM} />
                                    </div>
                                </div>

                            <div>
                                <label className="text">
                                    Upload
                                </label><br/>
                                <UploadComponent setFile={functionToSetFiles} type={"skpm_files"} />
                            </div>
                            <div>
                                <label className="text">
                                    Uploaded Files
                                </label><br/>
                                <div>

                                    { formData?.["skpm_files"]?.map(val => <div>
                                        <a href="/" onClick={(e) => handleFileNameClick(val?.name, e)}>{val?.name}</a>
                                        {val?.name.endsWith('.csv') && (
                                            <CsvDialogButton link_function={fetchDownloadLink} file_name={val?.name} experiment_name={formData?.experiment_name} experiment_type="SKPM (UW)" />
                                        )}
                                    </div>) }
                                </div>
                            </div>
                            {/*<Button label="Submit" onClick={saveProduct}/>*/}
                            {/* <Button label="Submit" onClick={()=>saveProduct(allTypes[4])}/> */}
                            <div className="button-container">
                                <div  className="butt">
                                    <Button className="butt" label="Save Data" onClick={()=>saveProduct(allTypes[4])}  />
                                </div>
                            </div>
                        </div>
                    </TabPanel>


                </TabView>
            </Dialog>
        </div>

    )

}