<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kode OTP</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f4f7fa;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 500px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
        }
        .content {
            padding: 30px;
            text-align: center;
        }
        .otp-code {
            background: #f1f5f9;
            border: 2px dashed #6366f1;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 8px;
            color: #6366f1;
        }
        .message {
            color: #64748b;
            line-height: 1.6;
        }
        .warning {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 12px;
            margin-top: 20px;
            text-align: left;
            font-size: 14px;
            color: #92400e;
        }
        .footer {
            background: #f8fafc;
            padding: 20px;
            text-align: center;
            color: #94a3b8;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔐 DiagnoSpace</h1>
        </div>
        <div class="content">
            <p class="message">Halo <strong>{{ $name }}</strong>,</p>
            @if($type === 'reset_password')
            <p class="message">Gunakan kode OTP berikut untuk mereset password akun Anda:</p>
            @else
            <p class="message">Gunakan kode OTP berikut untuk menyelesaikan pendaftaran akun Anda:</p>
            @endif
            
            <div class="otp-code">{{ $otp }}</div>
            
            <p class="message">Kode ini berlaku selama <strong>10 menit</strong>.</p>
            
            <div class="warning">
                ⚠️ Jangan bagikan kode ini kepada siapapun. Tim DiagnoSpace tidak pernah meminta kode OTP Anda.
            </div>
        </div>
        <div class="footer">
            <p>Email ini dikirim otomatis. Mohon jangan membalas email ini.</p>
            <p>&copy; {{ date('Y') }} DiagnoSpace. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
