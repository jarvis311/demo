import React, { useEffect, useState } from 'react';
import CommonTable from '../VehicleScrapOld/CommonTable';
import Button from '@mui/material/Button';
import CommSelect from '../VehicleScrapOld/CommSelect';
import { toast } from 'react-toastify';
import Layout from '../../layout/Layout';
import axios from 'axios';

const Home = () => {
    const [catagoryOption, setCatagoryOption] = useState([])
    const [rows, setRows] = useState([])
    const [setselectCategoryValue, setSetselectCategoryValue] = useState('')
    const [setRowsData, setSetRowsData] = useState([])
    const [setselectBrandValue, setSetselectBrandValue] = useState("")
    const [brandOption, setBrandOption] = useState([])

    const getVehicleData = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/get-vehicles`);
            const data = response.data;
            setRows(
                data.map(vehicle => ({
                    id: vehicle._id,
                    php_id: vehicle.php_id,
                    model_name: vehicle.model_name,
                    price_range: vehicle.price_range,
                    min_price: vehicle.min_price,
                    fuel_type: vehicle.fuel_type,
                    avg_rating: vehicle.avg_rating,
                    review_count: vehicle.review_count,
                    brandName: vehicle.brand_id.name,
                    brandId: vehicle.brand_id._id,
                    categoryName: vehicle.category_id.category_name,
                    categoryId: vehicle.category_id._id,
                }))
            );
            setSetRowsData(
                data.map(vehicle => ({
                    id: vehicle._id,
                    php_id: vehicle.php_id,
                    model_name: vehicle.model_name,
                    price_range: vehicle.price_range,
                    min_price: vehicle.min_price,
                    fuel_type: vehicle.fuel_type,
                    avg_rating: vehicle.avg_rating,
                    review_count: vehicle.review_count,
                    brandName: vehicle.brand_id.name,
                    brandId: vehicle.brand_id._id,
                    categoryName: vehicle.category_id.category_name,
                    categoryId: vehicle.category_id._id,
                }))
            )
        } catch (error) {
            console.error('Error fetching vehicle data:', error);
        }
    }
    const handleButtonClick = async (id) => {
        const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/mongo-tomysql`, { vehicleId: id })
        if (response) {
            toast("Vehicle succesfully scrapped!!")
        }
    }
    const columns = [
        { field: 'php_id', headerName: 'ID', width: 70 },
        { field: 'model_name', headerName: 'Model Name', width: 130 },
        { field: 'price_range', headerName: 'Price Range', type: 'number', width: 130, },
        { field: 'min_price', headerName: 'Minmum Price', width: 90, },
        { field: 'fuel_type', headerName: 'Fuel Type', width: 90, },
        { field: 'avg_rating', headerName: 'Avgrage Rating', width: 90, },
        { field: 'review_count', headerName: 'Review Count', width: 90, },
        { field: 'brandName', headerName: 'Category', width: 90, },
        { field: 'categoryName', headerName: 'Brand', width: 90,/* sortable: false,width: 90 */ },
        {
            field: 'button', // Unique field name for the button column
            headerName: 'Actions', // Header name for the button column
            width: 150,
            renderCell: (params) => (
                <Button onClick={() => handleButtonClick(params.row.id)} variant="contained">Live</Button>
            ),
        },
    ];

    const getCategory = async () => {
        const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/get-category`)
        setCatagoryOption(pre =>
            response?.data?.map(item => {
                return {
                    label: item?.category_name,
                    value: item?._id
                }
            }
            )
        )
    }
    // const getBrand = async () => {
    //     const response = await axios.get("http://localhost:3535/get-brand")
    //     setBrandOption(pre =>
    //         response?.data?.map(item => {
    //             return {
    //                 label: item?.name,
    //                 value: item?._id
    //             }
    //         }
    //         )
    //     )
    // }
    console.log('setselectBrandValue', setselectBrandValue)
    useEffect(() => {
        if (setselectCategoryValue) {
            setSetRowsData(pre =>
                rows.filter(item => item.categoryId === setselectCategoryValue)
            )
        } else if (setselectBrandValue) {
            setSetRowsData(pre =>
                rows.filter(item => item.brandId === setselectBrandValue)
            )
        }
        else {
            setSetRowsData(rows)
        }
    }, [setselectCategoryValue, setselectBrandValue])

    useEffect(() => {
        getVehicleData()
        getCategory()
        // getBrand()
    }, [])

    const handleChange = (event) => {
        setSetselectCategoryValue(event.target.value);
    };

    const handleChangeBrand = (event) => {
        setSetselectBrandValue(event.target.value);
    };

    return (
        <Layout sidebar={true}>
            <CommSelect
                label="Select Category"
                value={setselectCategoryValue}
                onChange={handleChange}
                options={catagoryOption}
            />
            {/* <CommSelect
                label="Select Brand"
                value={setselectBrandValue}
                onChange={handleChangeBrand}
                options={brandOption}
            /> */}
            <CommonTable columns={columns} data={setRowsData} />

        </Layout>
    )
}

export default Home