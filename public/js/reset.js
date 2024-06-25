function submitForm() {
    var email = document.getElementById('email').value;

    // Perform basic validation (you can expand this as needed)
    if (!email) {
        alert('Please enter your email address.');
        return;
    }

    // Send email address to server-side for further processing (e.g., sending reset link)
    fetch('/forgotpassword', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email })
    })
    .then(response => {
        if (response.ok) {
            // Handle success (e.g., show a message to the user)
            alert('Password reset instructions sent to your email.');
            // Optionally, redirect to login page or handle UI accordingly
        } else {
            // Handle error (e.g., show an error message)
            alert('Failed to submit request. Please try again later.');
        }
    })
    .catch(error => {
        // Handle network error or other issues
        console.error('Error:', error);
        alert('An unexpected error occurred.');
    });
}
