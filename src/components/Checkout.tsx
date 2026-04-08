import { loadStripe, StripeEmbeddedCheckoutOptions } from "@stripe/stripe-js";
import { useCallback, useState, useEffect } from "react";
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

export default function Checkout() {
  const stripePromise = loadStripe("pk_test_51T2GGJK6pnqzlaKMLIo3ACFSkattdMMnhcnnl2mf4lKYnU413WoMjmIN5y8Q802uZ3lpNcNUzYzqnd21c2kWkjKD00jEx9CEQe");

  const fetchClientSecret = useCallback(async () => {
    try {
      console.log("Fetching client secret from http://localhost:8080/checkout/create-checkout-session");
      const res = await fetch("http://localhost:8080/checkout/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (!res.ok) {
        console.error(`Fetch failed with status ${res.status}: ${res.statusText}`);
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      console.log("Client secret retrieved successfully");
      return data.clientSecret;
    } catch (error) {
      console.error("Error fetching client secret:", error);
      throw error;
    }
  }, []);

  const options: StripeEmbeddedCheckoutOptions = {fetchClientSecret};

  return (
     <div id="checkout">
      <EmbeddedCheckoutProvider
        stripe={stripePromise}
        options={options}
      >
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}