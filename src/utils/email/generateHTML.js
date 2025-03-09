export const template = (otpCode, firstName, subject) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            text-align: center;
            padding: 20px;
        }
        .email-container {
            background-color: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            max-width: 500px;
            margin: auto;
        }
        .email-header {
            font-size: 22px;
            color: #333;
        }
        .email-body {
            font-size: 16px;
            color: #555;
        }
        .activate-button {
            display: inline-block;
            background-color: #007BFF;
            color: #fff;
            text-decoration: none;
            padding: 12px 20px;
            border-radius: 5px;
            margin-top: 15px;
            font-weight: bold;
        }
        .email-footer {
            font-size: 12px;
            color: #777;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <h1 class="email-header">${subject}</h1>
        <div class="email-body">
            <h2>Hello, ${firstName}</h2>
            <p>Your OTP code is:</p>
            <h2 class="activate-button">${otpCode}</h2>
            <p>This code will expire in 10 minutes.</p>
            <p>If you did not request this, please ignore this email.</p>
            <p>Best regards, <br> [Your Company Name] Team</p>
        </div>
        <div class="email-footer">
            <p>© 2024 [Your Company Name]. All rights reserved.</p>
            <p><a href="[SupportLink]">Contact Support</a> | <a href="[UnsubscribeLink]">Unsubscribe</a></p>
        </div>
    </div>
</body>
</html>
`;