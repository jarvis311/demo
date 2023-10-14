import { Route, Routes } from 'react-router-dom';
import 'rsuite/dist/rsuite.css';
import './bootstrap.css';
import 'boxicons/css/boxicons.css';
import './App.css';
import './utilities.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Home from './pages/Home';

import VehicleScrap from './pages/VehicleScrap/VehicleScrap';
import VehicleScrapAdd from './pages/VehicleScrap/VehicleScrapAdd';

import VehicleScrapOld from './pages/VehicleScrapOld/VehicleScrap';
import VehicleScrapAddOld from './pages/VehicleScrapOld/VehicleScrapAdd';

function App() {
  // console.log('process.env.REACT_APP_BASE_URL',)
  return (
    <div className="App">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <Routes>
        <Route path='/' element={<Home />} />

        <Route path="/VehicleScrap" element={<VehicleScrap />} />
        <Route path="/VehicleScrap/VehicleScrapAdd" element={<VehicleScrapAdd />} />

        <Route path="/VehicleScrapOld" element={<VehicleScrapOld />} />
        <Route path="/VehicleScrapAddOld" element={<VehicleScrapAddOld />} />
      </Routes>
    </div>
  );
}

export default App;
