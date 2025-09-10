import './App.css';
import Header from './components/layouts/Header';
import Footer from './components/layouts/Footer';
import Slideshow from './components/SlideShow';
import offer1 from './assets/offer1.jpg';
import offer2 from './assets/offer2.jpg';
import offer3 from './assets/offer3.jpg';

function App() {
  const slidesImages = [
    { image: offer1, link: '/', alt: 'offer-image' },
    { image: offer2, link: '/', alt: 'offer-image' },
    { image: offer3, link: '/', alt: 'offer-image' }
  ]
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Slideshow slides={slidesImages} />
        {/* Page content here */}
      </main>
      <Footer />
    </div>
  )
}


export default App
