function submitResetForm(token) {
    var password = document.getElementById('password').value;
    var confirmPassword = document.getElementById('confirmPassword').value;

    if (!password || !confirmPassword) {
        alert('Please enter and confirm your new password.');
        return;
    }

    if (password !== confirmPassword) {
        alert('Passwords do not match.');
        return;
    }

    fetch('/reset/' + token, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password: password })
    })
    .then(response => {
        if (response.ok) {
            alert('Password has been reset successfully.');
            window.location.href = '/signIn';
        } else {
            alert('Failed to reset password. Please try again.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An unexpected error occurred.');
    });
}
