# CircleStay 🏠

A modern rental marketplace with integrated bill splitting and trust-based reputation system. CircleStay connects renters and hosts while fostering trust through verified actions and peer ratings.

![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Firebase](https://img.shields.io/badge/Firebase-12.7.0-orange)
![License](https://img.shields.io/badge/license-MIT-green)

## 🌟 Features

### Core Features
- **🏘️ Rental Marketplace**: Browse and list rental properties with advanced filtering
- **💰 Commons (Bill Splitting)**: Create pools to split rent and bills with roommates
- **⭐ Trust Score System**: Build reputation through verified actions and peer ratings
- **🔐 ID Verification**: Boost trust score with government ID verification (mock)
- **📊 Real-time Notifications**: Stay updated on pool activities and ratings
- **🖼️ Image Upload**: Cloudinary integration for property and profile photos

### Trust Score Features
- **Dynamic Scoring Algorithm**: Base score (50) + ID Verification (20) + Rating Score (30) + Activity Bonus (20)
- **Peer Rating System**: Rate roommates after each payment
- **Transparent Breakdown**: See exactly how your trust score is calculated
- **Visual Indicators**: Color-coded trust levels with modern animations

### Marketplace Features
- **Advanced Filters**: Filter by connection type, property type, price range
- **Search Functionality**: Quick search across listings
- **Sidebar Navigation**: Clean, intuitive filtering interface
- **Responsive Design**: Mobile-first approach with desktop optimization

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16.1.1 (App Router)
- **Language**: TypeScript 5.0
- **Styling**: Tailwind CSS 4.0
- **Animations**: Framer Motion 12.25
- **Icons**: Lucide React
- **Date Handling**: date-fns

### Backend
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Storage**: Cloudinary
- **Server**: Express.js (API routes)
- **Admin SDK**: Firebase Admin

### Development Tools
- **Build System**: Turbopack
- **React Compiler**: Babel Plugin React Compiler 1.0
- **Linting**: ESLint 9
- **Dev Server**: Nodemon & Concurrently

## 📁 Project Structure

```
circlestay/
├── src/
│   ├── app/                      # Next.js App Router pages
│   │   ├── api/                  # API routes
│   │   │   └── users/search/     # User search endpoint
│   │   ├── commons/              # Bill splitting pages
│   │   │   ├── page.tsx          # Pools dashboard
│   │   │   └── [poolId]/         # Individual pool details
│   │   ├── listings/             # Property listings
│   │   │   ├── [id]/             # Listing details
│   │   │   └── create/           # Create new listing
│   │   ├── marketplace/          # Browse listings with filters
│   │   ├── profile/              # User profile management
│   │   │   ├── [id]/             # Public profile view
│   │   │   └── edit/             # Edit own profile
│   │   ├── trust-score/          # Trust score breakdown page
│   │   ├── login/                # Authentication
│   │   ├── signup/               
│   │   └── onboarding/           # New user setup
│   ├── components/               # Reusable React components
│   │   ├── AddBillModal.tsx      # Bill creation interface
│   │   ├── CreatePoolModal.tsx   # Pool creation interface
│   │   ├── RateUserModal.tsx     # Peer rating system
│   │   ├── TrustScoreIndicator.tsx # Animated score display
│   │   ├── Navbar.tsx            # Main navigation
│   │   ├── NotificationCenter.tsx # Real-time notifications
│   │   └── ProtectedRoute.tsx    # Auth guard
│   ├── contexts/
│   │   └── AuthContext.tsx       # Firebase auth state
│   └── lib/                      # Utility libraries
│       ├── firebase.ts           # Firebase client config
│       ├── firestore.ts          # User & rating operations
│       ├── firestore-pools.ts    # Pool & bill operations
│       ├── cloudinary.ts         # Image upload utilities
│       └── api.ts                # API client
├── server/                       # Express backend
│   ├── index.js                  # Server entry point
│   ├── config/
│   │   ├── firebase.js           # Admin SDK setup
│   │   └── cloudinary.js         # Cloudinary config
│   ├── middleware/
│   │   └── auth.js               # JWT verification
│   └── routes/
│       └── auth.js               # Auth endpoints
├── public/                       # Static assets
├── FIRESTORE_RULES.md           # Security rules documentation
├── BACKEND_SETUP.md             # Backend configuration guide
└── circlestay-*-adminsdk.json   # Firebase service account

```

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ and npm
- Firebase project with Firestore enabled
- Cloudinary account
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd circlestay
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Firebase Client Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

   # Backend API
   NEXT_PUBLIC_API_URL=http://localhost:5000/api

   # Cloudinary
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

4. **Add Firebase Admin SDK credentials**
   
   Download your Firebase Admin SDK JSON file and place it in the root directory.

5. **Configure Firestore Security Rules**
   
   Go to Firebase Console → Firestore Database → Rules and apply rules from `FIRESTORE_RULES.md`

### Running the Application

**Development mode (recommended):**
```bash
npm run dev:all
```
This runs both Next.js (port 3000) and Express server (port 5000) concurrently.

**Run separately:**
```bash
# Next.js frontend
npm run dev

# Express backend (in another terminal)
npm run server:dev
```

**Production build:**
```bash
npm run build
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🔥 How It Works

### Authentication System
- **Firebase Auth** handles user authentication with email/password
- **AuthContext** provides global auth state across the app
- **ProtectedRoute** component guards authenticated pages
- JWT tokens are verified on the Express backend for API requests

### Trust Score Algorithm

The trust score is calculated using multiple factors to create a comprehensive reputation system:

```typescript
Trust Score = Base Score + ID Verification + Rating Score + Activity Bonus

Base Score: 50 points (everyone starts here)
ID Verification: +20 points (one-time verification)
Rating Score: Up to 30 points (based on average rating: avgRating/5 * 30)
Activity Bonus: Up to 20 points (2 points per rating received, max 10 ratings)

Maximum Score: 120 points
```

**Score Levels:**
- 🟣 90-120: Exceptional
- 🟢 80-89: Excellent  
- 🔵 70-79: High Reliability
- 🟡 60-69: Good Standing
- 🟠 0-59: Building Trust

### Commons (Bill Splitting)

**How it works:**
1. **Create a Pool**: Set up a shared expense pool with roommates
2. **Add Members**: Invite users by email to join the pool
3. **Log Bills**: Any member can add bills with custom split ratios
4. **Track Balances**: System calculates who owes what in real-time
5. **Rate Members**: After payments, rate roommates to build trust

**Balance Calculation:**
- Each bill creates obligations based on split amounts
- Balances are calculated as: `paid - owed`
- Positive balance = others owe you
- Negative balance = you owe others

### Rating System

**When can you rate?**
- After participating in a pool with shared bills
- Only once per bill per user (prevents spam)
- Must be in the same pool as the rated user

**Rating Categories:**
- Reliability
- Communication
- Payment Promptness
- General Experience

**Impact on Trust Score:**
- Each rating contributes to average rating
- Average rating affects score: `(avgRating / 5) * 30 points`
- More ratings increase activity bonus: `min(ratingsCount * 2, 20)`

### Marketplace & Listings

**Creating Listings:**
1. Fill out property details (title, description, price)
2. Select property type (apartment, house, room, studio)
3. Choose connection type (friends, colleagues, open)
4. Upload property images via Cloudinary
5. Listing appears in marketplace immediately

**Filtering System:**
- **Connection Type**: Filter by who can apply
- **Property Type**: Narrow by property category
- **Price Range**: Set min/max budget
- **Search**: Text search across titles/descriptions
- All filters work together for precise results

### Notifications

**Real-time notifications for:**
- New pool invitations
- Bill additions
- Payment reminders
- New ratings received
- Profile views

Notifications are stored in Firestore and fetched on-demand to avoid requiring composite indexes.

## 🔒 Security

### Firestore Security Rules

The application uses comprehensive security rules:

- **Users**: Read by all authenticated users, write only own profile
- **Listings**: Read by all, create by any, update/delete only by host
- **Reviews**: Read by all, create only, no edits/deletes
- **Pools**: Read by all, update only by members/creator
- **Bills**: Read by all, delete only by bill creator
- **UserRatings**: Read by all, create only, no edits/deletes
- **Notifications**: Read/update only by recipient

### Authentication

- All routes use `ProtectedRoute` wrapper for auth checks
- Express API endpoints verify Firebase JWT tokens
- Firestore rules enforce server-side security
- Sensitive operations (ID verification) require authentication

## 📱 Responsive Design

CircleStay is fully responsive:
- **Mobile**: Optimized for phones (320px+)
- **Tablet**: Enhanced layout for medium screens (768px+)
- **Desktop**: Full-featured experience (1024px+)
- **Animations**: Smooth transitions and hover effects
- **Dark mode ready**: Uses CSS custom properties

## 🎨 Design System

### Colors
- **Primary**: Warm earth tones (terracotta/orange)
- **Secondary**: Complementary blues and greens
- **Trust Score Gradient**: Dynamic based on score level
- **Glass Morphism**: Frosted glass effects with backdrop blur

### Typography
- **Font**: Geist (optimized by Next.js)
- **Headings**: Bold gradient text effects
- **Body**: Clean, readable spacing

### Components
- Consistent card designs with glass morphism
- Animated indicators using Framer Motion
- Icon system via Lucide React
- Accessible form controls

## 🐛 Known Issues & Solutions

### Firebase Composite Index Errors
**Solution**: We avoid compound queries by filtering in JavaScript instead:
```typescript
// ❌ Requires composite index
query(ref, where('userId', '==', id), where('read', '==', false))

// ✅ No index needed
const docs = await getDocs(query(ref, where('userId', '==', id)))
const filtered = docs.filter(d => d.data().read === false)
```

### ID Verification (Mock)
The ID verification is currently a mock implementation. In production:
- Integrate with services like Stripe Identity or Persona
- Store verification status and documents securely
- Implement proper KYC compliance

## 🚧 Future Enhancements

- [ ] Real ID verification integration
- [ ] Payment gateway for rent/bills
- [ ] In-app messaging between users
- [ ] Calendar integration for viewing schedules
- [ ] Rental agreement templates
- [ ] Dispute resolution system
- [ ] Mobile app (React Native)
- [ ] Email notifications
- [ ] Social auth (Google, Facebook)
- [ ] Multi-language support

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

For questions or issues, please open an issue on GitHub.

---

Built with ❤️ using Next.js, Firebase, and modern web technologies.
