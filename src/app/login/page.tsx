import LoginForm from '@/modules/auth/ui/LoginForm';

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-6">
            {/* Background aurora decoration */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-accent/10 rounded-full blur-[150px] -z-10" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-accent/10 rounded-full blur-[150px] -z-10" />

            <LoginForm />
        </div>
    );
}
