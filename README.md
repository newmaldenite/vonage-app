# 🔐 Next-Gen Secure Access Management Platform

We are very grateful to have been given the chance to participate in this hackathon. It was a great learning expereince and through it we have learnt more about authentication and ways of authorizing at an advanced level- thank you!

The brief was to create a **Next-Gen Secure Access Management Platform** designed to provide robust user authentication, fraud detection, and secure access management tools. Security and user experiences were aslo key, with businesses are moving away from passwords toward more secure and seamless authentication methods. 

---

## 🚀 Tech Stack

- **Framework**: [Next.js](https://nextjs.org/)
- **Language**: TypeScript
- **Database**: [Supabase](https://supabase.com/)
- **Communications**: [Vonage APIs](https://developer.vonage.com/)  
- **Edge Functions** : [Deno](https://deno.land/)
  - Serverless runtime handling Vonage API interactions (Verify v2)

---

## ✨ Features

### ✅ Secure Login with Adaptive 2FA

Password-based login system enhanced with **adaptive two-factor authentication (2FA)**:

- 📱 **Mobile Device**: Use Vonage **Verify v2 API**
- 👤 **Admin**: use Supabase **Magic Link** 
- 💻 **Non-Mobile Device**: Send an OTP to email via Vonage **Verify v2 API**
- 🔄 **Fallback**: Default to SMS-based 2FA if device detection fails

**Login Flow:**

1. User enters email and password
2. System checks device type:
   - If **mobile**, send OTP via SMS
   - If **non-mobile**, send OTP via email
3. User receives appropriate message:
   - ✅ `Welcome back, [User Name].`
   - ❌ `Verification failed. Please contact support.`

---

### 👤 Secure Account Creation

Collect the following fields via registration form:

- Name
- Email (used as login identifier)
- Password (following security guidelines)
- Phone number (for 2FA)

---
### 🌍 Access Control & Risk Detection - Not yet implemented

Enhance login security through:

- **SIM Swap Check** via Vonage SIM Swap API
- **Location Verification** via Vonage Location Verification API

**Login Workflow Includes:**

- Verify SIM card status
- Check login location matches allowed areas
- Notify users of any suspicious activity

---
## First Admin User Setup

The first superuser is initialized via the `/scripts/create-first-admin.ts` script. To use it:

```bash
npx ts-node scripts/create-first-admin.ts admin@example.com
```

---
### 📊 Admin Dashboard (Optional)

A secure dashboard for system administrators to monitor fraud and user authentication trends.
- ✅ `Verification successful! Welcome back, [User Name].`
- The first superuser is initialized via the /scripts/create-first-admin.ts, please see for instructions for node.js input

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


**Authors**
https://github.com/codesungrape
https://github.com/newmaldenite

