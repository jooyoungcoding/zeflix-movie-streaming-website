import { Toaster } from "react-hot-toast";
export default function Discover() {
    return (
        <div>
            <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
            <h1 className="text-4xl font-bold text-white">Discover</h1>
        </div>
    );
}
