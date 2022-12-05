import { useNavigate } from "react-router-dom";
import React, { useEffect } from "react";

export default function NotFoundPage() {
  const navigate = useNavigate();

  useEffect(() => {
  
    navigate("/");
  }, [navigate]);

  return <div className="NotFoundPage">Page Not Found</div>;
}
