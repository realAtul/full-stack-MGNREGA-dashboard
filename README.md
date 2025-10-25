___MGNREGA Dashboard - Uttar Pradesh___
here is the link of loom video: https://www.loom.com/share/b3d37108f61440afbe1e721894ca0b83

A production-ready web application for citizens to view and understand MGNREGA (Mahatma Gandhi National Rural Employment Guarantee Act) performance data for their district.

## 🌟 Features

### For Citizens
- 🔍 **Easy District Search** - Find your district quickly
- 📊 **Visual Data** - Charts and graphs for easy understanding
- 🔊 **Audio Support** - Listen to summaries in Hindi/English
- 🏆 **Comparisons** - See how your district performs vs state average
- 📱 **Mobile Friendly** - Works perfectly on all devices
- 🌐 **Bilingual** - Complete support for Hindi and English
- ❓ **Help System** - Explanations for all terms

### Technical Features
- 💾 **Offline Support** - Local caching with db.json
- 🔄 **Auto Sync** - Updates data every 6 hours
- ⚡ **Retry Logic** - Handles API failures gracefully
- 🚀 **Production Ready** - Optimized for scale
- ♿ **Accessible** - WCAG compliant

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm 

### Installation

1. **Clone the repository**
```bash


2. **Setup Backend**
```bash
cd backend
npm install
cp .env.example .env
npm start
```

Backend will run on `http://localhost:5000`

3. **Setup Frontend** (in new terminal)
```bash
cd frontend
npm install
npm run dev
```

Frontend will run on `http://localhost:5173`

## 📁 Project Structure
```
mgnrega-dashboard/
├── backend/
│   ├── server.js           # Express server
│   ├── db.json            # Local data cache
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── DistrictSelector.jsx
│   │   │   ├── SummaryCard.jsx
│   │   │   └── YearSelector.jsx
│   │   ├── utils/
│   │   │   ├── formatNumber.js
│   │   │   ├── numberToHindi.js
│   │   │   └── speak.js
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── i18n.js
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

## 🔧 Configuration

### Backend Configuration (.env)
```env
PORT=5000
API_KEY=579b464db66ec23bdd000001e1ce8dd239b94236662d303835fbee2b
RESOURCE_ID=ee03643a
STATE=UTTAR PRADESH
SYNC_INTERVAL_HOURS=6
```

### Frontend Configuration (.env)
```env
VITE_API_URL=http://localhost:5000
```

## 📡 API Endpoints

### Get All Districts
```
GET /api/districts/:state
Query Params: fin_year (optional)
```

### Get Specific District
```
GET /api/district/:state/:districtCode
Query Params: fin_year (optional)
```

### Get State Statistics
```
GET /api/stats/:state
Query Params: fin_year (optional)
```

### Manual Sync
```
POST /api/sync
Body: { "state": "UTTAR PRADESH", "fin_year": "2024-2025" }
```

### Health Check
```
GET /api/health
```

## 🎨 Design Decisions

### For Low-Literacy Users
1. **Visual First** - Charts over numbers
2. **Audio Support** - Text-to-speech in local language
3. **Simple Language** - No technical jargon
4. **Color Coding** - Green (good), Orange (needs attention)
5. **Large Buttons** - Easy to tap on mobile
6. **Icons** - Universal symbols for recognition

### Production Architecture
1. **Local Caching** - Reduces API dependency
2. **Retry Mechanism** - Handles network failures
3. **Rate Limit Protection** - Serves from cache when needed
4. **Data Deduplication** - Ensures data quality
5. **Auto Sync** - Keeps data fresh automatically
6. **Error Handling** - Graceful degradation
7. **Responsive Design** - Works on all devices

## 📊 Data Source

Data is sourced from [data.gov.in](https://data.gov.in) MGNREGA API.

- **Resource ID**: ee03643a-ee4c-48c2-ac30-9f2ff26ab722
- **State**: Uttar Pradesh
- **Update Frequency**: Every 6 hours (configurable)

## 🔒 Security Considerations

- API keys stored in environment variables
- CORS configured for specific origins
- Input validation on all endpoints
- Rate limiting on sync endpoint
- No sensitive user data collected

## 🚀 Deployment

### Backend Deployment (Node.js Server)
```bash
# Build
cd backend
npm install --production

# Start with PM2
pm2 start server.js --name mgnrega-backend

# Or with Docker
docker build -t mgnrega-backend .
docker run -p 5000:5000 mgnrega-backend
```

### Frontend Deployment (Static Host)
```bash
# Build for production
cd frontend
npm run build

deployed on aws ec2
## 📈 Performance Optimization

- **Code Splitting** - Vendor and charts bundles separated
- **Lazy Loading** - Components loaded on demand
- **Memoization** - React.useMemo for expensive calculations
- **Debouncing** - Search input debounced
- **Image Optimization** - WebP format with fallbacks
- **Caching Strategy** - Service worker for offline support

## ♿ Accessibility

- **ARIA Labels** - All interactive elements
- **Keyboard Navigation** - Full keyboard support
- **Screen Reader** - Optimized for screen readers
- **Color Contrast** - WCAG AA compliant
- **Focus Indicators** - Visible focus states
- **Alt Text** - All images and icons

## 🌍 Browser Support

- Chrome/Edge (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see LICENSE file for details.

## 👥 Support

For support:
- Open an issue on GitHub
- Email: support@example.com
- Documentation: [Link to docs]

## 🙏 Acknowledgments

- Data source: [data.gov.in](https://data.gov.in)
- Icons: Emoji icons for universal recognition
- Charts: [Recharts](https://recharts.org)

## 📸 Screenshots

[Add screenshots of your application here]

## 🗺️ Roadmap

- [ ] Support for more states
- [ ] Offline PWA support
- [ ] Export data as PDF
- [ ] Comparison with neighboring districts
- [ ] Historical trend analysis
- [ ] SMS alerts for updates
- [ ] Multi-state comparison

---

**Made with ❤️ for rural India**
