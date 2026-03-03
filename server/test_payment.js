async function testPayment() {
    try {
        // 1. Get a book
        const booksRes = await fetch('http://localhost:5000/api/books/marketplace');
        const books = await booksRes.json();
        if (books.length === 0) {
            console.log("No books found in marketplace.");
            return;
        }
        const book = books[0];
        console.log(`Found book: ${book.title} (ID: ${book._id}) with price ${book.price}`);

        // 2. Try to create a checkout session
        console.log("Initiating payment request...");
        const res = await fetch('http://localhost:5000/api/payment/create-checkout-session', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                bookId: book._id,
                userId: "605c72eb8d6b8b0015f65a12"
            })
        });

        if (!res.ok) {
            const errorText = await res.text();
            console.error("Payment API Error:", res.status, errorText);
            return;
        }

        const data = await res.json();
        console.log("Success! Checkout URL: ", data.url);
    } catch (err) {
        console.error("Fetch Error:", err.message);
    }
}

testPayment();
