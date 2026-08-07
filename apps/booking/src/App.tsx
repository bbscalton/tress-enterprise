import { Routes, Route } from 'react-router-dom';
import { initFirebase } from '@fleetrentals/shared';
import { Header } from './components/Header';
import { HomePage } from './pages/HomePage';
import { BookPage } from './pages/BookPage';

initFirebase();

export default function App() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-4xl mx-auto p-4 pb-12">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/book" element={<BookPage />} />
        </Routes>
      </main>
    </div>
  );
}
