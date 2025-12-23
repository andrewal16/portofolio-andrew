<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Contact Message</title>
    <style>
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #020617 0%, #0f172a 100%);
            margin: 0;
            padding: 40px 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: #0f172a;
            border: 1px solid rgba(99, 102, 241, 0.2);
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(6, 182, 212, 0.15);
        }
        .header {
            background: linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%);
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            color: #ffffff;
            font-size: 24px;
            font-weight: 700;
            letter-spacing: -0.5px;
        }
        .header p {
            margin: 8px 0 0;
            color: rgba(255, 255, 255, 0.9);
            font-size: 14px;
        }
        .content {
            padding: 40px 30px;
        }
        .field {
            margin-bottom: 24px;
        }
        .field-label {
            display: block;
            color: #06b6d4;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 8px;
            font-family: 'Monaco', 'Courier New', monospace;
        }
        .field-value {
            color: #e2e8f0;
            font-size: 16px;
            line-height: 1.6;
            padding: 12px;
            background: rgba(30, 41, 59, 0.5);
            border-left: 3px solid #06b6d4;
            border-radius: 4px;
        }
        .message-box {
            background: rgba(30, 41, 59, 0.5);
            border: 1px solid rgba(99, 102, 241, 0.2);
            border-radius: 8px;
            padding: 20px;
            color: #cbd5e1;
            line-height: 1.8;
            font-size: 15px;
        }
        .footer {
            padding: 20px 30px;
            background: rgba(6, 182, 212, 0.05);
            border-top: 1px solid rgba(99, 102, 241, 0.1);
        }
        .meta-info {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            color: #64748b;
            font-family: 'Monaco', 'Courier New', monospace;
        }
        .badge {
            display: inline-block;
            background: rgba(6, 182, 212, 0.2);
            color: #06b6d4;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 600;
            letter-spacing: 0.5px;
            text-transform: uppercase;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📬 New Contact Message</h1>
            <p>Someone wants to connect with you!</p>
        </div>
        
        <div class="content">
            <div class="field">
                <span class="field-label">👤 Identifier // Name</span>
                <div class="field-value">{{ $name }}</div>
            </div>

            <div class="field">
                <span class="field-label">📧 Digital Address // Email</span>
                <div class="field-value">
                    <a href="mailto:{{ $email }}" style="color: #06b6d4; text-decoration: none;">
                        {{ $email }}
                    </a>
                </div>
            </div>

            <div class="field">
                <span class="field-label">📱 Frequency // Phone</span>
                <div class="field-value">{{ $phone }}</div>
            </div>

            <div class="field">
                <span class="field-label">💬 Payload // Message</span>
                <div class="message-box">
                    {!! nl2br(e($messageContent)) !!}
                </div>
            </div>
        </div>

        <div class="footer">
            <div class="meta-info">
                <span>⏰ {{ $submittedAt }}</span>
                <span class="badge">🔒 Encrypted</span>
                <span>🌐 {{ $ipAddress }}</span>
            </div>
        </div>
    </div>
</body>
</html>