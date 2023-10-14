import React, { useEffect, useState } from 'react';
import { Button, Card, Col, Row, Table, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Layout from '../../layout/Layout';
import Pagination from "rc-pagination";
import { SelectPicker } from "rsuite";
import axios from 'axios';
import { toast } from 'react-toastify';

const data = ['Bike', 'Car', 'Truck', 'Helicopter', 'Plane', 'Ships'].map(
    item => ({ label: item, value: item })
);
const perpage = ['10', '50', '100', '200'].map(
    item => ({ label: item, value: item })
);


const VehicleScrap = () => {
    const [perPage, setPerPage] = useState(10);
    const [size, setSize] = useState(perPage);
    const [current, setCurrent] = useState(1);
    const [vehiclebranddata, setVehiclebranddata] = useState([])



    const handleGetVehicleData = async () => {
        const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/get-vehicles`);
        setVehiclebranddata(response.data)
    }

    useEffect(() => {
        handleGetVehicleData()
    }, [])

    const onChange = page => {
        setCurrent(page);
    };
    const getData1 = (current, pageSize) => {
        return vehiclebranddata.slice((current - 1) * pageSize, current * pageSize);
    };

    const PerPageChange = (value) => {
        setSize(value);
        const newPerPage = Math.ceil(vehiclebranddata.length / value);
        if (current > newPerPage) {
            setCurrent(newPerPage);
        }
    };

    const paginationData = (page, pageSize) => {
        setCurrent(page);
        setSize(pageSize);
    };

    const PrevNextArrow = (current, type, originalElement) => {
        if (type === "prev") {
            return <button className="paggination-btn">Previous</button>;
        }
        if (type === "next") {
            return <button className="paggination-btn">Next</button>;
        }
        return originalElement;
    };
    const handleLiveClick = async (id) => {
        console.log('id', id)
        const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/mongo-tomysql`, { vehicleId: id })
        if (response) {
            toast("Vehicle succesfully scrapped!!")
        }
    }
    const renderData = getData1(current, size).map((item, ind) => (

        <tr>
            <td className='text-center'>{(current === 1) ? ind + 1 : current * size + ind + 1 - size}</td>
            <td>{item.model_name}</td>
            <td>{item.price_range}</td>
            <td>{item.min_price}</td>
            <td>{item.fuel_type}</td>
            <td>{item.avg_rating}</td>
            <td>{item.review_count}</td>
            <td>{item.brand_id.name}</td>
            <td>{item.category_id.category_name}</td>
            <td className='text-center'>
                <Button variant='primary' onClick={() => handleLiveClick(item._id)} className='px-3 py-1'>Live</Button>
            </td>
        </tr>
    ))

    return (
        <Layout sidebar={true}>
            <div className="page-heading">
                <h3 className="my-1">Vehicle Scrap</h3>
                <div className="page-heading-right">
                    <Form.Control
                        type="text"
                        name="reg_no"
                        placeholder="Serach Category"
                        className="wv-200 my-1 ms-3"
                    />
                    <SelectPicker
                        data={data}
                        cleanable={false}
                        placement="bottomEnd"
                        className="wv-200 my-1 ms-3"
                        placeholder="Select Category"
                    />
                    <SelectPicker
                        data={perpage}
                        cleanable={false}
                        searchable={false}
                        placement="bottomEnd"
                        className="wv-100 my-1 ms-3"
                    />
                    <Link to="/VehicleScrap/VehicleScrapAdd" className="my-1 ms-3">
                        <Button variant="primary" value="create">
                            Add New
                        </Button>
                    </Link>
                </div>
            </div>
            <div className="page-content">
                <Row>
                    <Col xs={12}>
                        <Card>
                            <Card.Body>
                                <Table bordered responsive>
                                    <thead>
                                        <tr>
                                            <th width="5%">No</th>
                                            <th width="20%">Modal Name</th>
                                            <th width="13%">Price Range</th>
                                            <th width="10%">Minmum Price</th>
                                            <th width="10%">Fuel Type</th>
                                            <th width="10%">Average Review</th>
                                            <th width="8%">Review</th>
                                            <th width="8%">Category</th>
                                            <th width="8%">Brand</th>
                                            <th width="8%" className="text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {renderData}
                                    </tbody>
                                </Table>
                                <div className="pagination-custom">
                                    <Pagination
                                        showTitle={false}
                                        className="pagination-data"
                                        onChange={paginationData}
                                        total={vehiclebranddata.length}
                                        current={current}
                                        pageSize={size}
                                        showSizeChanger={false}
                                        itemRender={PrevNextArrow}
                                        onShowSizeChange={PerPageChange}
                                    />
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </div>
        </Layout>
    )
}

export default VehicleScrap