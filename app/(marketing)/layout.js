import Header from '@/components/marketing/Header';
import Footer from '@/components/marketing/Footer';
import { AnimatedBackground } from '@/components/ui/animated-background';

export default function MarketingLayout({ children }) {
    return (
        <AnimatedBackground variant="gradient">
            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-grow">
                    {children}
                </main>
                <Footer />
            </div>
        </AnimatedBackground>
    );
}
