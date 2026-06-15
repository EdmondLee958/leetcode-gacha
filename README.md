# LeetCode Gacha

A full-stack roguelike web game where players earn gacha rolls by solving LeetCode problems.

## Live Demo

Frontend: https://leetcode-gacha.vercel.app/

## Overview

LeetCode Gacha is a turn-based roguelike game designed to encourage coding practice through game progression.

Players connect a LeetCode account, earn rolls by solving new problems, recruit characters through a gacha system, build a party, and attempt dungeon runs featuring turn-based combat, rewards, progression, and permadeath.

## Features

### Account System

* User registration and login
* JWT authentication
* Persistent user progress

### LeetCode Integration

* LeetCode GraphQL API integration
* Track solved problems
* Award rolls for newly completed problems
* Prevent duplicate rewards

### Gacha System

* Spend rolls to obtain characters
* Multiple character classes and rarities
* Persistent character inventory

### Party Management

* Select a lineup of 4 characters
* View character stats and abilities
* Save and update team compositions

### Turn-Based Combat

* Speed-based turn order
* Character-specific abilities
* Target selection
* Buff and healing mechanics
* Battle log system

### Roguelike Progression

* Encounter progression
* Reward selection between battles
* Permanent character death
* Run management and scoring

### Frontend Features

* Responsive React interface
* Character and enemy sprites
* Combat animations
* Inventory management
* Battle UI with skill descriptions

## Technology Stack

### Frontend

* React
* Vite
* JavaScript
* HTML
* CSS

### Backend

* Node.js
* Express.js
* JWT Authentication
* REST APIs

### Database

* MongoDB Atlas
* Mongoose

### External APIs

* LeetCode GraphQL API

### Deployment

* Vercel
* Render
* GitHub

## Local Installation

### Clone Repository

```bash
git clone https://github.com/EdmondLee958/leetcode-gacha.git
cd leetcode-gacha
```

### Install Backend Dependencies

```bash
npm install
```

### Install Frontend Dependencies

```bash
cd frontend
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Create a `.env` file inside `frontend`:

```env
VITE_API_URL=http://localhost:5000
```

### Start Backend

```bash
npm start
```
## Note

The backend is hosted on Render's free tier and may take up to a minute to wake up after periods of inactivity.

### Start Frontend

```bash
cd frontend
npm run dev
```

## Author

Edmond Lee
