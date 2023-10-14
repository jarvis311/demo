import React from "react";
import Layout from "../layout/Layout";
import { Col, Row, Card } from "react-bootstrap";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    defaults
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

defaults.font.family = 'Maven Pro';
defaults.font.size = 14;

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Home = () => {
    
    const vehiclecategorydata = {
        labels: ['Bike', 'Car', 'Truck', 'Helicopter', 'Plane', 'Ships'],
        datasets: [
        {
            label: 'Vehicle Category',
            data: [100, 25, 75, 28, 20, 50],
            barThickness: 16,
            backgroundColor: [ '#FFB15C', '#DB73FF', '#1FD9A3', '#6A9BF4', '#e74c3c', '#8652ff'],
        }],
    };
    const vehiclecategoryoptions = {
        responsive: true,
        plugins: {
          title: {
            display: false,
          },
          legend: {
            display: false,
          },
        },
        scales: {
          y: {
            ticks: {
              stepSize: 20,
            },
            grid: {
              display: true,
            },
            scaleLabel: {
              display: true,
            }
          },
          x: {
            grid: {
              display: false,
            },
            scaleLabel: {
              display: true,
            }
          }
        }
    };

    const vehiclebranddata = {
        labels: ['Bike', 'Car', 'Truck', 'Helicopter', 'Plane', 'Ships'],
        datasets: [
            {
                label: 'Vehicle Brand',
                data: [100, 25, 75, 28, 20, 50],
                backgroundColor: [ '#FFB15C', '#DB73FF', '#1FD9A3', '#6A9BF4', '#e74c3c', '#8652ff'],
            },
        ],
    }
    const vehiclebrandoptions = {
        responsive: true,
        plugins: {
          title: {
            display: false,
          },
          legend: {
            display: true,
            position: 'bottom',
            align: 'center',
            labels: {
                boxWidth: 12,
                boxHeight: 12,
                usePointStyle: true
            }
          },
        },
    };

    return(
        <Layout sidebar={true}>
            <div className="vv-dashboard">
                <Row>
                    <Col xxl={2} xl={4} md={6}>
                        <Card>
                            <Card.Body>
                                <div className="counter orange">
                                    <div className="counter-media">
                                        <i className='bx bx-cycling'></i>   
                                    </div>
                                    <div className="counter-content">
                                        <h3>100</h3>
                                        <p>Bike</p>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col xxl={2} xl={4} md={6}>
                        <Card>
                            <Card.Body>
                                <div className="counter pink">
                                    <div className="counter-media">
                                        <i className='bx bxs-car'></i>
                                    </div>
                                    <div className="counter-content">
                                        <h3>25</h3>
                                        <p>Car</p>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col xxl={2} xl={4} md={6}>
                        <Card>
                            <Card.Body>
                                <div className="counter green">
                                    <div className="counter-media">
                                        <i className='bx bxs-truck'></i>
                                    </div>
                                    <div className="counter-content">
                                        <h3>75</h3>
                                        <p>Truck</p>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col xxl={2} xl={4} md={6}>
                        <Card>
                            <Card.Body>
                                <div className="counter blue">
                                    <div className="counter-media">
                                        <i className='bx bx-heading'></i>
                                    </div>
                                    <div className="counter-content">
                                        <h3>28</h3>
                                        <p>Helicopter</p>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col xxl={2} xl={4} md={6}>
                        <Card>
                            <Card.Body>
                                <div className="counter red">
                                    <div className="counter-media">
                                        <i className='bx bxs-plane-alt'></i>
                                    </div>
                                    <div className="counter-content">
                                        <h3>20</h3>
                                        <p>Plane</p>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col xxl={2} xl={4} md={6}>
                        <Card>
                            <Card.Body>
                                <div className="counter purple">
                                    <div className="counter-media">
                                        <i className='bx bxs-ship'></i>
                                    </div>
                                    <div className="counter-content">
                                        <h3>50</h3>
                                        <p>Ships</p>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
                <Row>
                    <Col lg={8}>
                        <Card>
                            <Card.Body>
                                <div className="chart-title">
                                    <h4>Vehicle Category</h4>
                                </div>
                                <Bar options={vehiclecategoryoptions} data={vehiclecategorydata} height="100"/>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col lg={4}>
                        <Card>
                            <Card.Body>
                                <div className="chart-title">
                                    <h4>Vehicle Brand</h4>
                                </div>
                                <Doughnut options={vehiclebrandoptions} data={vehiclebranddata} height="100"/>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </div>
        </Layout>
    )
}

export default Home