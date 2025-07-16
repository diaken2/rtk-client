import Link from 'next/link';
import Logo from '@/components/ui/Logo';

export default function CompletePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Logo />
          <div className="text-sm text-gray-600 text-right max-w-xs">
            Мы гарантируем безопасность и сохранность ваших данных
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-rt-text mb-6">
            Заявка отправлена!
          </h1>
          
          <p className="text-xl text-gray-700 mb-12">
            Специалист перезвонит в течение 15 минут для уточнения деталей
          </p>

          <div className="bg-rt-gray-bg rounded-lg p-8">
            <p className="text-lg font-semibold text-rt-text mb-4">
              Не пропустите звонок!
            </p>
            
            <p className="text-gray-600 mb-6">
              Мы перезвоним с одного из номеров:
            </p>
            
            <div className="space-y-2">
              <div className="text-lg font-medium text-rt-text">
                8 995 673-85-79
              </div>
              <div className="text-lg font-medium text-rt-text">
                8 999 100-10-03
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 