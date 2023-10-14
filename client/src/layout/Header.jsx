import React from 'react'
import { Link } from 'react-router-dom'
import DarkMode from "../Component/DarkMode";
import { Button, Dropdown } from 'react-bootstrap';
import LogoMini from '../Component/Logo-mini';

const Header = ({ openSidebar }) => {
    return (
        <>
            <header className="sidebar-header">
                <div className="header-left-menu">
                    <Link to="/" className='d-xl-none'>
                        <LogoMini />
                    </Link>
                </div>
                <div className="header-right-menu">
                    <DarkMode />
                    <Dropdown>
                        <Dropdown.Toggle id="dropdown-autoclose-true">
                            <div className="user-menu">
                                <div className="user-img">
                                    <img src="/../logo/appicon.jpg" />
                                </div>
                                <div className="user-name ms-2">
                                    <h6>RTO Vehicle Information</h6>
                                    <p>Admin</p>
                                </div>
                            </div>
                        </Dropdown.Toggle>

                        <Dropdown.Menu className="dropdown-menu dropdown-menu-end">
                            <Dropdown.Item>
                                Logout
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                    <Button className="burger-btn d-xl-none" onClick={openSidebar}>
                        <i className='bx bx-menu fs-3'></i>
                    </Button>
                </div>
            </header>
        </>
    )
}

export default Header