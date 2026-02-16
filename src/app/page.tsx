import DynamicLanding from '@/modules/landing-pages/ui/DynamicLanding';
import { MemberAccessButton } from '@/shared/ui/MemberAccessButton';

export default function Home() {
  return (
    <main className="relative">
      <MemberAccessButton />
      <DynamicLanding />
    </main>
  );
}
