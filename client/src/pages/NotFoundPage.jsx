import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, HeartHandshake } from 'lucide-react';
import { Container, Button, Card } from '../components/ui';

export default function NotFoundPage() {
  return (
    <div className="py-24 md:py-32">
      <Container size="narrow">
        <Card doubleBezel={true} className="text-center">
          <div className="p-8 sm:p-12 space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-brand-50 border border-brand-200 text-brand-600 flex items-center justify-center mx-auto shadow-sm">
              <HeartHandshake className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-5xl sm:text-6xl font-extrabold font-display text-slate-900 tracking-tight">
                404
              </span>
              <h1 className="font-display font-bold text-2xl text-slate-800">
                Healthcare Resource Not Found
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                The healthcare department, doctor profile, or page you were looking for cannot be located or may have been relocated.
              </p>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Link to="/">
                <Button size="md" variant="primary" icon={Home}>
                  Return to Home
                </Button>
              </Link>
              <Link to="/how-it-works">
                <Button size="md" variant="outline">
                  How MediConnect Works
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </Container>
    </div>
  );
}
