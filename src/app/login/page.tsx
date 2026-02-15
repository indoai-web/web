import LoginForm from '@/modules/auth/ui/LoginForm';

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-6">
            {/* Background aurora decoration */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-violet-accent/20 rounded-full blur-[120px] -z-10 animate-aurora" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-teal-accent/20 rounded-full blur-[120px] -z-10 animate-aurora" />

            <LoginForm />
        </div>
    );
}
