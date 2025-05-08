import React from "react";
import { Link } from "react-router-dom";

const NonPage = () => {
  return (
    <div className="container mx-auto py-8 px-4 text-center">
      <h1 className="text-3xl font-bold text-gray-900">404 - Page Not Found</h1>
      <p className="text-lg text-gray-600 mt-4">
        The page you're looking for doesn't exist.
      </p>
      <Link
        to="/"
        className="mt-6 inline-block bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
      >
        Go to Home
      </Link>
    </div>
  );
};

export default NonPage;
