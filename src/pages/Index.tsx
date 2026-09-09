import Header from '@/components/Header';
import Hero from '@/components/Hero';
import BoardSection from '@/components/BoardSection';
import PantheonSection from '@/components/PantheonSection';
import ClassesSection from '@/components/ClassesSection';
import PriestsSection from '@/components/PriestsSection';
import RulesSection from '@/components/RulesSection';
import DragonsSection from '@/components/DragonsSection';
import LobbySection from '@/components/LobbySection';
import RankingSection from '@/components/RankingSection';
import CallToActionSection from '@/components/CallToActionSection';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <BoardSection />
        <PantheonSection />
        <ClassesSection />
        <PriestsSection />
        <RulesSection />
        <DragonsSection />
        <LobbySection />
        <RankingSection />
        <CallToActionSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;