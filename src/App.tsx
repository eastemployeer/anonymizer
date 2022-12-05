import React from "react";
import { Route, Routes } from "react-router-dom";
import NotFoundPage from "./views/NotFoundPage";
import HomePage from "./views/HomePage";
import "./App.css";

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}
