import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Success() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("Verifying Payment...");

  useEffect(() => {
    const verifyPayment = async () => {
      const sessionId = searchParams.get('session_id');
      const bookId = searchParams.get('bookId');
      const userId = searchParams.get('userId');

      if (!sessionId || !bookId || !userId) return;

      try {
        await axios.post('/api/payment/verify-payment', {
          sessionId,
          bookId,
          userId
        });
        setStatus("Payment Successful! Book added to Library.");

        // Redirect to library after 3 seconds
        setTimeout(() => navigate('/'), 3000);
      } catch {
        setStatus("Verification Failed. Please contact support.");
      }
    };

    verifyPayment();
  }, [navigate, searchParams]);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>{status}</h2>
      <p>Redirecting you to your library...</p>
    </div>
  );
}

export default Success;
