# Online Recruitment & Assessment – React Frontend

A modern React frontend for an online recruitment platform supporting candidates, employers, and admins. It covers job browsing & applications, employer job management, interview scheduling, and notifications.

---

## ✨ Key Features

#### Candidate Portal

- Create and manage profiles
- Search & apply for job postings
- Track application status
- Receive real-time notifications

#### Employer Dashboard

- Create & manage job postings
- Review candidate applications
- Candidate evaluation & interview scheduling
- Application progress tracking

#### Admin Functions

- Manage user roles & permissions
- Generate reports
- Monitor system performance

---

## 🛠️ Tech Stack

- **Frontend:** React.js
- **Backend:** Node.js (Express.js)
- **Database:** MongoDB
- **Authentication:** JWT (JSON Web Tokens) with Role-Based Access Control
- **Deployment:** AWS EC2 + PM2
- **CI/CD:** GitHub Actions
- **Design:** Figma (UI/UX Prototypes)

### 🔧 Installation & SetupPrerequisites

### 1) Clone the Repository

```bash
git clone https://github.com/windywindd/Online-Recruitment-and-Assessment.git
cd Online-Recruitment-and-Assessment
```

### 2) Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3) Environment Variables

Create a `.env` file in the **backend** directory:

```bash
MONGO_URI=mongodb+srv://windd:123@taskmanagercluster.jz10eks.mongodb.net/?retryWrites=true&w=majority&appName=TaskmanagerCluster
JWT_SECRET=2J8zqkP7VN6bxzg+Wy7DQZsd3Yx8mF3Bl0kch6HYtFs=
PORT=5001
```

### 4) Run the Application

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

##### **Account you pre-registered**

1. **Employee**: windy@gmail.com
   **Password**: 123
2. **Employer**: boss@gmail.com
   **Password**: 123

##### **Access the Website**

http://`<your public ip address>`

---

## ✅ Testing

- **Unit Testing** : Mocha + Chai for backend functionality
- **API Testing** : Postman collections included in `/tests/api`
- **CI/CD** : GitHub Actions runs automated tests on each commit

---

## 📁 Project Structure

```
Online-Recruitment-and-Assessment/
│── backend/           # Node.js + Express API
│   ├── config/        # DB connection & environment
│   ├── controllers/   # Request handlers (Command Pattern)
│   ├── middleware/    # Auth & validation (CoR, Proxy)
│   ├── models/        # Mongoose schemas
│   ├── routes/        # Express routes (Facade)
│   └── tests/         # Unit & API tests
│
│── frontend/          # React app
│   ├── src/components
│   ├── src/pages
│   └── src/context
│
└── docs/              # SRS, design docs, testing report
```

---

## 🎨 UI/UX Prototype

- **Figma Design (High Fidelity):**

  [View Figma Design](https://www.figma.com/design/7a19qk2Z1eKpRJZIGTaJpn/version-1?node-id=0-1)

- **Figma Prototype:**

  [View Interactive Prototype](https://www.figma.com/proto/7a19qk2Z1eKpRJZIGTaJpn/version-1?page-id=0%3A1&node-id=1-2)

---

## 👥 Team Collaboration

- **Version Control:** GitHub (feature branches, pull requests, code reviews)
- **Collaboration Evidence:** Commits, merge conflicts, and branch tracking available in GitHub history

---

## 🔒 Safety & Risk Management

- Encrypted candidate data storage
- Role-based authentication & access control
- Automated daily database backups
- UI testing to reduce complexity risks
- Compliance with data privacy laws

---

## 📌 Future Improvements

- AI-based candidate ranking & resume parsing
- Advanced analytics for employers
- Real-time chat between candidates & employers
- Mobile application (React Native)

---

## 📜 License

This project is developed for educational purposes under **QUT IFN636** .

All rights reserved by Group 69.
