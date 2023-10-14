import React, { useEffect, useState } from 'react';
import CommSelect from '../VehicleScrapOld/CommSelect';
import axios from 'axios';
import { Button, TextField } from '@mui/material';
import { toast } from 'react-toastify';
import Layout from '../../layout/Layout';

const ScrapVehicles = () => {
    const [setselectCategoryValue, setSetselectCategoryValue] = useState('')
    const [setSelectBrandValue, setSetSelectBrandValue] = useState('')
    const [setselectScrapType, setSetselectScrapType] = useState("")
    const [link, setLink] = useState("")
    const [catagoryOption, setCatagoryOption] = useState([])
    const [brandOption, setBrandOption] = useState([])

    const getCategory = async () => {
        const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/get-category`)
        setCatagoryOption(pre =>
            response?.data?.map(item => {
                return {
                    label: item?.category_name,
                    value: item?.php_id
                }
            }
            )
        )
    }
    console.log("first")
    const getBrand = async () => {
        if (setselectCategoryValue) {
            console.log(setselectCategoryValue)
            const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/get-brand/${setselectCategoryValue}`)
            setBrandOption(pre =>
                response?.data?.map(item => {
                    return {
                        label: item?.name,
                        value: item?.name
                    }
                }
                )
            )
        }
    }
    useEffect(() => {
        getCategory()
    }, [])
    useEffect(() => {
        getBrand()
    }, [setselectCategoryValue])


    const handleCategoryChange = (event) => {
        setSetselectCategoryValue(event.target.value);
    }
    const handleBrandChange = (event) => {
        setSetSelectBrandValue(event.target.value);
    }
    const handleScrpeType = (event) => {
        setSetselectScrapType(event.target.value);
    }
    const bodyData = {
        category: setselectCategoryValue,
        brand: setSelectBrandValue,
        scrap_type: setselectScrapType,
        link: link || ''
    }
    const handleSubmit = async () => {
        if (setselectCategoryValue && setSelectBrandValue && setselectScrapType) {

            await axios.post(`${process.env.REACT_APP_BASE_URL}/scrap_bike`, bodyData).then(respose => {
                setSetselectCategoryValue("")
                setSetSelectBrandValue("")
                setSetselectScrapType("")
                setLink("")
                toast("Vehicle srapped!!")
            })
        }
    }

    return (
        <Layout sidebar={true}>
            <div>
                <CommSelect
                    label="Select Category"
                    value={setselectCategoryValue}
                    onChange={handleCategoryChange}
                    options={catagoryOption} />
                <CommSelect
                    label="Select brand"
                    value={setSelectBrandValue}
                    onChange={handleBrandChange}
                    options={brandOption} />

                <CommSelect
                    label="Select Scrap Type"
                    value={setselectScrapType}
                    onChange={handleScrpeType}
                    options={[
                        {
                            label: "Brand",
                            value: "brand"
                        },
                        {
                            label: "Vehicle",
                            value: "vehicle"
                        }
                    ]} />
                {
                    setselectScrapType === "vehicle" &&
                    <TextField
                        required
                        id="outlined-required"
                        label="Enter link"
                        onChange={e => setLink(e.target.value)}
                        value={link}
                    />
                }
                <Button type='submit' onClick={handleSubmit} style={{ marginTop: "10px", marginLeft: "10px" }} disabled={(setselectCategoryValue && setSelectBrandValue && setselectScrapType) ? false : true} variant="contained">Submit</Button>
            </div>
        </Layout>
    )
}

export default ScrapVehicles