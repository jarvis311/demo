import React, { useEffect, useState } from 'react';
import { Button, Card, Col, Row, Form, Breadcrumb } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../../layout/Layout';
import { SelectPicker } from "rsuite";
import axios from 'axios';
import { toast } from 'react-toastify';

const scrapeTypeData = ['vehicle', 'brand'].map(
    item => ({ label: item, value: item })
);
const VehicleScrapAdd = () => {

    const [categoryOption, setCategoryOption] = useState([])
    const [setBrandOption, setSetBrandOption] = useState([])
    const [setselectCategoryValue, setSetselectCategoryValue] = useState("")
    const [setsetselectBrandValue, setSetsetselectBrandValue] = useState("")
    const [scarpType, setScarpType] = useState("")
    const [link, setLink] = useState("")
    const navigate = useNavigate()
    const getBrand = async (e) => {
        if (e) {
            const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/get-brand/${e}`)
            console.log(response)
            setSetBrandOption(pre =>
                response?.data?.map(item => {
                    return {
                        label: item?.name,
                        value: item?.name
                    }
                }))
        }
    }

    const bodyData = {
        category: setselectCategoryValue,
        brand: setsetselectBrandValue,
        scrap_type: scarpType,
        link: link || ''
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (setselectCategoryValue && setsetselectBrandValue && scarpType) {
            await axios.post(`${process.env.REACT_APP_BASE_URL}/scrap_bike`, bodyData).then(respose => {
                setSetselectCategoryValue("")
                setSetsetselectBrandValue("")
                setScarpType("")
                setLink("")
                toast(respose.data.response_message)
                console.log('respose>>>>', respose)
                if (respose.data.response_code || respose.data.status == 200) {
                    navigate("/VehicleScrap")
                }
            })
        }
    }
    useEffect(() => {
        getCategory()
    }, [])

    const getCategory = async () => {
        const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/get-category`)
        setCategoryOption(pre =>
            response?.data?.map(item => {
                return {
                    label: item?.category_name,
                    value: item?.php_id
                }
            }
            )
        )
    }
    const categoryOnchange = (e) => {
        setSetselectCategoryValue(e)
        getBrand(e)
    }
    return (
        <Layout sidebar={true}>
            <div className="page-heading">
                <h3 className="my-1">Vehicle Scrap Add</h3>
                <Breadcrumb className="d-none d-sm-none d-md-none d-lg-block">
                    <Breadcrumb.Item >
                        <Link to="/"><i className='bx bx-home-alt me-2 fs-5' ></i> Home</Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item >
                        <Link to="/VehicleScrap">Vehicle Scrap</Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item active>Create Vehicle Scrap</Breadcrumb.Item>
                </Breadcrumb>
            </div>
            <div className="page-content">
                <Form noValidate onSubmit={handleSubmit}>
                    <Card>
                        <Card.Body>
                            <Row>
                                <Col md={4}>
                                    <Form.Label htmlFor="category">Category</Form.Label>
                                    <SelectPicker
                                        data={categoryOption}
                                        cleanable={false}
                                        className="my-2"
                                        // block
                                        onChange={e => categoryOnchange(e)}
                                        placeholder="Select Category"
                                    />
                                </Col>
                                <Col md={4}>
                                    <Form.Label htmlFor="brand">Brand</Form.Label>
                                    <SelectPicker
                                        data={setBrandOption}
                                        cleanable={false}
                                        className="my-2"
                                        onChange={e => setSetsetselectBrandValue(e)}
                                        // block
                                        placeholder="Select Brand"
                                    />
                                </Col>
                                <Col md={4}>
                                    <Form.Label htmlFor="scraptype">Scrap Type</Form.Label>
                                    <SelectPicker
                                        data={scrapeTypeData}
                                        cleanable={false}
                                        className="my-2"
                                        onChange={e => setScarpType(e)}
                                        // block
                                        placeholder="Select Scrap Type"
                                    />
                                </Col>
                                <Col md={12}>
                                    <Form.Label htmlFor="link">Link</Form.Label>
                                    <Form.Control type="text" className="my-2" value={link} onChange={e => setLink(e.target.value)} name="link" />
                                </Col>
                            </Row>
                        </Card.Body>
                        <Card.Footer className="text-end">
                            <Button variant="primary" className="me-3" type='submit' >Save</Button>
                            <Button variant="secondary">Cancle</Button>
                        </Card.Footer>
                    </Card>
                </Form>
            </div>
        </Layout>
    )
}

export default VehicleScrapAdd