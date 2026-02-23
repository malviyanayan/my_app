import { Link } from 'react-router-dom';
import { FaUsers, FaShieldAlt, FaChartLine, FaArrowRight, FaCheckCircle } from 'react-icons/fa';
import './Home.css';

const Home = () => {
  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              Welcome to <span className="highlight">MyApp</span>
            </h1>
            <p className="hero-description">
              Your comprehensive platform for managing accounts, accessing powerful admin features, and exploring intuitive dashboards.
            </p>
            <div className="hero-buttons">
              <Link to="/auth" className="btn btn-primary">
                Get Started <FaArrowRight />
              </Link>
              <Link to="/auth" className="btn btn-secondary">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Everything you need</h2>
            <p className="section-description">
              Powerful features designed to streamline your workflow
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon blue">
                <FaUsers />
              </div>
              <h3 className="feature-title">User Management</h3>
              <p className="feature-description">
                Create and manage user accounts with our secure authentication system.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon purple">
                <FaShieldAlt />
              </div>
              <h3 className="feature-title">Admin Control</h3>
              <p className="feature-description">
                Access powerful administrative tools with comprehensive system management.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon green">
                <FaChartLine />
              </div>
              <h3 className="feature-title">Analytics Dashboard</h3>
              <p className="feature-description">
                Monitor activities with real-time insights and detailed reports.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits">
        <div className="container">
          <div className="benefits-content">
            <div className="benefits-text">
              <h2 className="section-title">Why choose MyApp?</h2>
              <p className="section-description">
                Join thousands of users who trust MyApp for their daily operations.
              </p>
              
              <ul className="benefits-list">
                <li>
                  <FaCheckCircle className="check-icon" />
                  <span>Enterprise-grade security</span>
                </li>
                <li>
                  <FaCheckCircle className="check-icon" />
                  <span>24/7 customer support</span>
                </li>
                <li>
                  <FaCheckCircle className="check-icon" />
                  <span>99.9% uptime guarantee</span>
                </li>
                <li>
                  <FaCheckCircle className="check-icon" />
                  <span>Advanced analytics</span>
                </li>
              </ul>
            </div>

            <div className="benefits-stats">
              <div className="stat-card">
                <div className="stat-number">10K+</div>
                <div className="stat-label">Active Users</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">99.9%</div>
                <div className="stat-label">Uptime</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">24/7</div>
                <div className="stat-label">Support</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">50+</div>
                <div className="stat-label">Features</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to get started?</h2>
            <p className="cta-description">
              Create your account today and unlock all premium features.
            </p>
            <Link to="/auth" className="btn btn-white">
              Start Free Trial <FaArrowRight />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
