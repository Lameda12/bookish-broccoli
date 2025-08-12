# 🧠 Wisdom Connect - Expert Consulting Platform

[![Deploy to Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https%3A%2F%2Fgithub.com%2Fyour-username%2Fwisdom-connect)

## 🚀 Live Demo

Visit our live beta platform: [https://wisdom-connect.railway.app](https://wisdom-connect.railway.app)

## 📋 Overview

Wisdom Connect is a revolutionary platform that bridges the gap between companies seeking expertise and retired industry veterans looking to share their knowledge. Our beta platform showcases the potential of connecting businesses with seasoned professionals who have decades of experience.

### ✨ Key Features

- **🔍 Expert Discovery**: Advanced search and filtering system to find the perfect expert
- **👥 Dual Interface**: Separate optimized experiences for clients and experts
- **📱 Mobile-First Design**: Responsive design that works perfectly on all devices
- **🎨 Modern UI**: Beautiful glassmorphism design with Tailwind CSS
- **⚡ Performance Optimized**: Fast loading and smooth animations
- **💬 Feedback Collection**: Built-in system for collecting user feedback during beta

## 🛠 Technology Stack

- **Frontend**: HTML5, Tailwind CSS, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Hosting**: Railway.app
- **Styling**: Tailwind CSS with custom animations
- **Performance**: Compression, Security headers, CDN optimization

## 🏗 Project Structure

```
wisdom-connect/
├── index.html          # Main HTML file with Tailwind integration
├── script.js           # JavaScript functionality
├── server.js           # Express server for Railway deployment
├── package.json        # Node.js dependencies and scripts
├── railway.json        # Railway deployment configuration
└── README.md          # This file
```

## 🚂 Deployment to Railway

### Quick Deploy (Recommended)

1. Click the "Deploy to Railway" button above
2. Connect your GitHub account
3. Railway will automatically build and deploy your app
4. Your app will be live at `https://your-app-name.railway.app`

### Manual Deployment

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway**
   ```bash
   railway login
   ```

3. **Initialize Project**
   ```bash
   railway init wisdom-connect
   ```

4. **Deploy**
   ```bash
   railway up
   ```

### Environment Configuration

Railway automatically handles most configuration, but you can set these optional environment variables:

- `NODE_ENV=production` (automatically set by Railway)
- `PORT` (automatically set by Railway)
- `GA_MEASUREMENT_ID` (for Google Analytics - optional)

## 💻 Local Development

### Prerequisites

- Node.js 14.0.0 or higher
- npm or yarn

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/wisdom-connect.git
   cd wisdom-connect
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:3000
   ```

## 🎨 Customization

### Tailwind Configuration

The Tailwind configuration is embedded in `index.html` and includes:

- **Custom Colors**: Primary, accent, and success color schemes
- **Animations**: Custom keyframe animations for enhanced UX
- **Extended Theme**: Custom fonts, spacing, and component styles

### Modifying Styles

All styles use Tailwind CSS classes. Key customization areas:

- **Colors**: Update the color palette in the Tailwind config
- **Animations**: Modify or add new animations in the keyframes section
- **Layout**: Adjust responsive breakpoints and grid layouts
- **Typography**: Update font families and sizing scales

## 📊 Features Overview

### For Clients (Companies)
- Advanced expert search with multiple filters
- Expert profile browsing with ratings and reviews
- Direct connection capabilities
- Feedback submission system

### For Experts
- Professional onboarding form
- Skills and experience showcase
- Pricing and availability settings
- Platform feedback collection

### Beta Testing Features
- Comprehensive feedback collection
- User experience rating system
- Feature request gathering
- LinkedIn profile integration for networking

## 🔧 API Endpoints

The server includes basic API endpoints for future backend integration:

- `POST /api/feedback/client` - Client feedback submission
- `POST /api/feedback/expert` - Expert feedback submission
- `POST /api/expert/application` - Expert application submission
- `GET /health` - Health check for monitoring

## 📈 Performance Features

- **Compression**: Gzip compression for faster loading
- **Security**: Helmet.js security headers
- **Caching**: Static asset caching
- **CDN**: Tailwind CSS served via CDN
- **Lazy Loading**: Image optimization (ready for implementation)

## 🧪 Beta Testing

This platform is currently in beta testing phase. We're actively collecting:

- User experience feedback
- Feature requests
- Bug reports
- Platform improvement suggestions

## 🤝 Contributing

We welcome contributions from the community! Areas where you can help:

1. **UI/UX Improvements**: Enhance the design and user experience
2. **Feature Development**: Add new functionality
3. **Performance Optimization**: Improve loading times and responsiveness
4. **Bug Fixes**: Help identify and fix issues
5. **Testing**: Test the platform on different devices and browsers

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, feature requests, or bug reports:

- Create an issue on GitHub
- Contact us through the platform feedback form
- Email: support@wisdomconnect.com (when available)

## 🔮 Future Roadmap

- **Backend Integration**: Full database and API implementation
- **Payment System**: Secure payment processing for consultations
- **Video Calls**: Integrated video consultation platform
- **Mobile App**: Native mobile applications
- **AI Matching**: Intelligent expert-client matching system
- **Analytics Dashboard**: Comprehensive analytics for both clients and experts

---

**Built with ❤️ for connecting wisdom with opportunity**

🚀 **Ready to transform expert consulting?** Deploy now and help us build the future!
