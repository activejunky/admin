import React, { FormEvent } from 'react';
import logo from './logo.svg';
import './App.css';
import { Routes, Route, Link } from "react-router-dom";
import { DigitalEventsPage } from './Pages/CreateDigitalEventsPage';
import { AllDigitalEventsPage } from './Pages/AllDigitalEventsPage';
import { Backend, baseUrl } from './Backend/Api';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/cms" element={<AllDigitalEventsPage />} />
        <Route path="/cms/:id" element={<DigitalEventsPage />} />
      </Routes>
    </div>
  );
}


const Login: React.FC<{}> = ({ }) => {
  const [inputEmail, setInputEmail] = React.useState<string>('')
  const [inputPwd, setInputPwd] = React.useState<string>('')

  return (
    <div className="w-full flex justify-center items-center border h-screen flex-col">
      <form
        className='flex flex-col w-1/2 h-64 border justify-between'
        onSubmit={(e) => {

          e.preventDefault();
          const target = e.currentTarget as typeof e.currentTarget & {
            email: { value: string };
            password: { value: string };
          };
          const email = target.email.value; // typechecks!
          const password = target.password.value;

          alert(`YOU JUST SUBMITTED: ${email} - ${password}`)
        }}>
        <label className='font-bold'>
          Email:
          <input className='border ml-4' type="email" name="email" value={inputEmail} onChange={(e) => { e.preventDefault(); setInputEmail(e.currentTarget.value) }} />
        </label>
        <label className="font-bold">
          Password:
          <input className="border ml-4" type="password" name="password" value={inputPwd} onChange={(e) => { e.preventDefault(); setInputPwd(e.currentTarget.value) }} />
        </label>
        <input className='rounded border border-blue-500 px-4 py-4' type="submit" value="Submit" />
      </form>

      <nav className='mt-20 underline'>
        <Link style={{ fontSize: 30 }} to="/cms">CMS</Link>
      </nav>
    </div>
  )
}

const Home = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <h1>Home</h1>
      <nav className='underline'>
        <Link style={{ fontSize: 30 }} to="/cms">CMS</Link>
      </nav>
    </div>
  )
}


export default App;
