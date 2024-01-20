import {Button} from 'primereact/button';
import React, {useContext, useEffect, useRef, useState} from 'react';
import {UserContext} from '../contexts/user.context';
import {Toast} from "primereact/toast";
import DataTable, {FilterComponent} from 'react-data-table-component';
import {Toolbar} from "primereact/toolbar";
import {QRCodeViewer} from "../dialogs/QRCodeViewer";
import {QRScanner} from "../dialogs/QRScanner.dialog";
import {UpdateProductInfo} from "../dialogs/Form.dialog";
import {InputText} from "primereact/inputtext";
import {DataForm} from "../dialogs/NewProduct.dialog";
import DownloadButton from "../dialogs/FolderDownload";
import {useNavigate} from "react-router-dom";
import MyPlotlyComponent from "../dialogs/SolventChart";
import DownloadAll from "../dialogs/DownloadAll";


export default function Home() {
    const { logOutUser, user} = useContext(UserContext);
    const toast = useRef(null);
    const [products, setProducts] = useState([]);

    const [filterText, setFilterText] = React.useState('');
    const [resetPaginationToggle, setResetPaginationToggle] = React.useState(false);

    const navigate = useNavigate();


    const redirectToAdminPage = () => {
        // Function to redirect the user to the admin page.
        navigate('/admin'); // Replace '/admin' with your admin page's route
    };

    const FilterComponent = ({ filterText, onFilter, onClear }) => {
        // function to handle search bar
        const [filterValueData, setFilterValueData] = useState(filterText);
        return (
            <span className="p-input-icon-right ">
                <div className={"flex flex-wrap gap-2"}>
                    <Button icon="pi pi-refresh" onClick={tableDataFetch} />
        		<InputText
                    id="search"
                    type="text"
                    placeholder="Filter by ID or Experiment Name"
                    aria-label="Search Input"
                    value={filterValueData}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter')
                            onFilter(filterValueData)
                    }  }
                    onChange={(e)=>setFilterValueData(e.target.value)}
                />

                </div>
    	</span>)
    };

    const subHeaderComponentMemo = React.useMemo(() => {
        const handleClear = () => {
            if (filterText) {
                setResetPaginationToggle(!resetPaginationToggle);
                setFilterText('');
            }
        };

        return (
            <FilterComponent onFilter={e => setFilterText(e)} onClear={handleClear} filterText={filterText} />
        );
    }, [filterText, resetPaginationToggle]);

    const columns = [{
        id : 'id',
        name : 'ID',
        selector : row => row?._id.toHexString(),
    },{
        id : 'name',
        name : 'Experiment name',
        selector : row => row?.experiment_name,
    },{
        id : 'date',
        name : 'Date and Time',
        selector : row => row?.experiment_dt.toString(),
    },{
        id : 'location',
        name : 'Location',
        selector : row => row?.experiment_location,
    },{
        id : 'user',
        name : 'User',
        selector : row => row?.user,
    },{
        id : 'actionBodyTemplate',
        name : '',
        cell : (rowData) => actionBodyTemplate(rowData),
    }]

    // This function is called when the user clicks the "Logout" button.
    const logOut = async () => {
        try {
            // Calling the logOutUser function from the user context.
            const loggedOut = await logOutUser();
            // Now we will refresh the page, and the user will be logged out and
            // redirected to the login page because of the <PrivateRoute /> component.
            if (loggedOut) {
                window.location.reload(true);
            }
        } catch (error) {
            alert(error)
        }


    }



    useEffect(() => {
        //ProductService.getProducts().then((data) => setProducts(data));
        const initialFunctionCall = async () => {
            if(filterText){
                try{
                    const functionName = "getProductIdInfo";
                    // console.log(filterText)
                    const data = await user.callFunction(functionName, filterText)
                    // console.log(data);
                    setProducts(data);
                } catch(e){
                    setProducts([])
                }


            }else{
                try{
                    await tableDataFetch();
                }catch (e){
                    toast.current.show({severity: 'error', summary: 'Error Message', detail: 'Error while fetching data', life: 3000});
                }
            }


        }
        initialFunctionCall();
    }, [filterText]);

    const tableDataFetch = async () => {

        const functionName = "getLast30";
        const data = await user.callFunction(functionName)
        setProducts(data);
    }



    const leftToolbarTemplate = () => {
        return (
            <div className="flex flex-wrap gap-2">

                {/*<Button label="New" icon="pi pi-plus" severity="success" onClick={openNew} />*/}
                {/*<NewProduct />*/}
                <DataForm />
                <QRScanner setGlobalFilter={(e)=>setFilterText(e)} />
                {user && user._profile.data.email === process.env.REACT_APP_ADMIN_ACCOUNT && (
                    <Button label="Admin Page" onClick={redirectToAdminPage} />
                )}
                {/* <MyPlotlyComponent/> */}
                <DownloadAll user={user}/>
                {/*<ChartMaker />*/}

            </div>
        );
    };

    const rightToolbarTemplate = () => {
        return (
            <div className="flex flex-wrap gap-2">

                <Button variant="contained" onClick={logOut}>Logout</Button>

            </div>
        );
    };

    const DownloadData = (rowData) => {
        const json = JSON.stringify(rowData);
        const encodedJson = encodeURIComponent(json);
        const fileName = `${rowData.rowData._id.toHexString()}.json`;
        const downloadUrl = `data:application/json;charset=utf-8,${encodedJson}`;

        const handleDownload = () => {
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };

        return (
            <Button icon="pi pi-file-word" rounded outlined className="ml-2" onClick={handleDownload} />
            // <a href={downloadUrl} download={fileName}>
            //     Download
            // </a>
        );
    };


    const actionBodyTemplate = (rowData) => {
        return (
            <React.Fragment>
                {/*{console.log(rowData)}*/}
                {/*<Button icon="pi pi-plus" rounded outlined className="mr-2" onClick={() => addProductInfo(rowData)} />*/}
                <UpdateProductInfo rowData = {rowData} label={""} icon={"pi pi-plus"}/>
                <QRCodeViewer rowData={rowData}/>
                <DownloadData rowData={rowData}/>
                <DownloadButton rowData={rowData} />
                {/*<DownloadFile rowData={rowData}/>*/}
            </React.Fragment>
        );
    };


    return (
        <>
            <Toast ref={toast} />



            <div className="card">

                <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>
                <font color="red" style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'}}>The default view showcases the latest 30 entries. To retrieve older records, please input the specific experiment name or ID in the search field.</font>
                <DataTable
                    columns={columns}
                    data={products}
                    subHeader
                    subHeaderComponent={subHeaderComponentMemo}
                    paginationResetDefaultPage={resetPaginationToggle}

                    pagination
                />

            </div>
        </>
    )
}