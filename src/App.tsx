import './App.css';
import Header from './components/layouts/Header';
import Footer from './components/Footer';

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        {/* Page content here */}
      </main>
      <Footer />
    </div>
  )
}


export default App
