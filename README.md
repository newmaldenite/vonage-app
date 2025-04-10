# 🔐 Next-Gen Secure Access Management Platform

In a world where security and user experience are key, businesses are moving away from passwords toward more secure and seamless authentication methods.

This project is a **Next-Gen Secure Access Management Platform** designed to provide robust user authentication, fraud detection, and secure access management tools.

---

## 🚀 Tech Stack

- **Framework**: [Next.js](https://nextjs.org/)
- **Language**: TypeScript
- **Backend-as-a-Service**: [Supabase](https://supabase.com/)
- **Communications**: [Vonage APIs](https://developer.vonage.com/)  
  - Messages API  
  - Number Verification API  
  - SIM Swap API  
  - Location Verification API

---

## ✨ Features

### ✅ Secure Login with Adaptive 2FA

Password-based login system enhanced with **adaptive two-factor authentication (2FA)**:

- 📱 **Mobile Device**: Use Vonage **Number Verification API**
- 👤 **Admin**: use Supabase **Magic Link** 
- 💻 **Non-Mobile Device**: Send an OTP via Vonage **Messages API**
- 🔄 **Fallback**: Default to SMS-based 2FA if device detection fails

**Login Flow:**

1. User enters email and password
2. System checks device type:
   - If **mobile**, trigger Number Verification API
   - If **non-mobile**, send OTP via SMS
3. User receives appropriate message:
   - ✅ `Verification successful! Welcome back, [User Name].`
   - ❌ `Verification failed. Please contact support.`
   - ❌ `Invalid OTP. Please try again.`

---

### 👤 Secure Account Creation

Collect the following fields via registration form:

- Name
- Email (used as login identifier)
- Password (following security guidelines)
- Phone number (for 2FA)
- Location (Country and City)

---

### 🌍 Access Control & Risk Detection

Enhance login security through:

- **SIM Swap Check** via Vonage SIM Swap API
- **Location Verification** via Vonage Location Verification API

**Login Workflow Includes:**

- Verify SIM card status
- Check login location matches allowed areas
- Notify users of any suspicious activity

---

### 📊 Admin Dashboard (Optional)

A secure dashboard for system administrators to monitor fraud and user authentication trends.
- ✅ `Verification successful! Welcome back, [User Name].`

**Dashboard Features:**
- None - only static boilerplate
  
---


### ⚙️ Custom Authentication Rules

Allow administrators to configure authentication behavior:

- Region-based login restrictions
- Stricter checks for high-risk accounts
- Custom rules for 2FA logic

---

## 🛠️ Setup Instructions

```bash
# 1. Clone the repository
git clone https://github.com/your-org/secure-access-platform.git
cd secure-access-platform

# 2. Install dependencies
npm install

# 3. Create .env file and configure environment variables
touch .env
