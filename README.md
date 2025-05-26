# PawsHearts - Pet Adoption Platform

PawsHearts is a full-stack web application that connects pet lovers with animals in need of a loving home. The platform facilitates pet adoption, community engagement, and sharing of pet-related experiences through blogs.

## Features

- **Pet Adoption**: Browse and adopt pets
- **Community**: Join pet-loving communities and chat with other members
- **Blog System**: Share and read pet-related stories and experiences
- **User Authentication**: Secure user registration and login
- **Real-time Chat**: Community messaging system
- **Responsive Design**: Mobile-friendly interface

## Tech Stack

- **Frontend**:
  - React.js
  - Material-UI
  - Emotion (for styled components)
  - Axios for API calls

- **Backend**:
  - Node.js
  - Express.js
  - MongoDB
  - JWT Authentication

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/pawshearts.git
cd pawshearts
```

2. Install server dependencies
```bash
npm install
```

3. Install client dependencies
```bash
cd client
npm install
```

4. Create a .env file in the server directory with the following variables:
```
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
```

5. Start the development server
```bash
# In the root directory
npm run dev
```

The application will be available at `http://localhost:3000`

## Project Structure

```
pawshearts/
├── client/             # React frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── contexts/
│   │   └── App.js
│   └── package.json
├── server/            # Node.js backend
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── server.js
└── package.json
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

Your Name - your.email@example.com
Project Link: https://github.com/yourusername/pawshearts 