import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

export default function Guest({ children }: PropsWithChildren) {
    return (
        <div className="min-h-screen flex flex-col sm:justify-center items-center p-4 lg:p-8 bg-gray-100">
            <div className="w-full sm:max-w-md px-6 py-4 bg-white shadow-md overflow-hidden sm:rounded-lg">
                <div className="mb-4">
                    <Link href="/">
                        <ApplicationLogo className="rounded-md w-45 h-20"/>
                    </Link>
                </div>
                <div>
                    {children}
                </div>
            </div>
        </div>
    );
}
