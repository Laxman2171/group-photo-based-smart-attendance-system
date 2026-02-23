# Setup & Running Guide

This guide will help you set up and run the Smart Attendance System on your local machine.

## Prerequisites

Before starting, make sure you have the following installed:

| Software | Version | Download Link |
|----------|---------|---------------|
| Node.js | v18+ | [nodejs.org](https://nodejs.org/) |
| Python | 3.8+ | [python.org](https://www.python.org/) |
| MongoDB Atlas Account | - | [mongodb.com/atlas](https://www.mongodb.com/atlas) |
| Cloudinary Account | - | [cloudinary.com](https://cloudinary.com/) |
| Git | Latest | [git-scm.com](https://git-scm.com/) |

## Step 1: Clone the Repository

```bash
git clone https://github.com/your-username/smart-attendance-system.git
cd smart-attendance-system
```

## Step 2: Backend Setup

### 2.1 Install Node.js Dependencies

```bash
cd backend
npm install
```

### 2.2 Create Environment File

Create a `.env` file in the `backend/` folder:

```bash
# Windows (PowerShell)
New-Item -Path .env -ItemType File

# OR manually create the file
```

Add the following content to `backend/.env`:

```env
# Server Configuration
PORT=5000

# MongoDB Connection String
# Get this from MongoDB Atlas: Database > Connect > Drivers
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?appName=<AppName>

# JWT Secret (use a strong random string)
JWT_SECRET=your-super-secret-key-change-this

# Cloudinary Configuration
# Get these from Cloudinary Dashboard: Settings > API Keys
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 2.3 Setting Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account (if you don't have one)
3. Create a new cluster (free tier is sufficient)
4. Click **"Connect"** on your cluster
5. Choose **"Drivers"**
6. Copy the connection string and replace in `.env`
7. **Important**: Replace `<password>` with your database user password
8. Add your IP to the whitelist: **Network Access > Add IP Address > Allow Access from Anywhere** (for development)

### 2.4 Setting Up Cloudinary

1. Go to [Cloudinary](https://cloudinary.com/) and sign up
2. Go to **Dashboard**
3. Copy:
   - Cloud Name
   - API Key
   - API Secret
4. Paste them in your `.env` file

## Step 3: AI Service Setup

### 3.1 Create Python Virtual Environment

```bash
cd ../ai-service

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows (PowerShell)
.\venv\Scripts\Activate.ps1

# Windows (Command Prompt)
.\venv\Scripts\activate.bat

# Linux/macOS
source venv/bin/activate
```

### 3.2 Install Python Dependencies

```bash
pip install flask deepface opencv-python numpy requests tf-keras
```

> **Note**: DeepFace requires TensorFlow. The installation might take a few minutes and require around 500MB of space.

### 3.3 First Run - Model Download

On first run, DeepFace will automatically download the required face recognition model (Facenet). This is a one-time download of approximately 90MB.

## Step 4: Frontend Setup

```bash
cd ../frontend-final
npm install
```

## Step 5: Running the Application

You need to run **3 terminals** simultaneously:

### Terminal 1: Backend Server

```bash
cd backend
npm run dev
```

Expected output:
```
🚀 Server is running on http://localhost:5000
✅ MongoDB connected successfully.
```

### Terminal 2: AI Service

```bash
cd ai-service

# Activate virtual environment first
.\venv\Scripts\Activate.ps1  # Windows PowerShell
# OR
source venv/bin/activate      # Linux/macOS

# Run the Flask app
python app.py
```

Expected output:
```
* Running on http://0.0.0.0:5001
* Debugger is active!
```

### Terminal 3: Frontend

```bash
cd frontend-final
npm run dev
```

Expected output:
```
VITE v7.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

## Step 6: Access the Application

Open your browser and go to:

```
http://localhost:5173
```

## Quick Start Commands Summary

```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - AI Service  
cd ai-service && .\venv\Scripts\Activate.ps1 && python app.py

# Terminal 3 - Frontend
cd frontend-final && npm run dev
```

## Troubleshooting

### Issue: MongoDB Connection Failed

**Error**: `MongoDB connection error: Authentication failed`

**Solution**: 
- Check your MONGO_URI in `.env`
- Ensure password doesn't contain special characters (or URL-encode them)
- Verify your IP is whitelisted in MongoDB Atlas

### Issue: Cloudinary Upload Failed

**Error**: `Invalid cloud_name`

**Solution**:
- Verify all three Cloudinary values in `.env`
- Check there are no extra spaces in values

### Issue: AI Service - Module Not Found

**Error**: `ModuleNotFoundError: No module named 'deepface'`

**Solution**:
```bash
# Make sure virtual environment is activated
.\venv\Scripts\Activate.ps1

# Reinstall dependencies
pip install flask deepface opencv-python numpy requests
```

### Issue: Face Detection Not Working

**Error**: `Could not find faces in image`

**Solution**:
- Ensure the image has clear, front-facing faces
- Good lighting is required
- Minimum face size should be visible clearly

### Issue: Port Already in Use

**Error**: `Port 5000 is already in use`

**Solution**:
```bash
# Windows - Find and kill process using port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# OR change PORT in .env file
```

## Production Build

### Frontend Production Build

```bash
cd frontend-final
npm run build
```

This creates a `dist/` folder with optimized static files.

### Backend Production

```bash
cd backend
npm start  # Uses node instead of nodemon
```

## Default Ports

| Service | Port | URL |
|---------|------|-----|
| Frontend | 5173 | http://localhost:5173 |
| Backend | 5000 | http://localhost:5000 |
| AI Service | 5001 | http://localhost:5001 |

## Need Help?

If you encounter any issues:
1. Check the terminal logs for detailed error messages
2. Ensure all environment variables are correctly set
3. Verify all services are running simultaneously
4. Check network connectivity to MongoDB Atlas and Cloudinary
