import { toast } from 'react-toastify';

export const showWhatsAppConnectToast = (openWhatsApp) => {
    toast.info(
        ({ closeToast }) => (
            <div className="flex gap-4 items-start p-4 rounded-xl border shadow-lg bg-white max-w-md w-full animate-fade-in-up">
                <div className="text-green-600 text-xl">💬</div>
                <div className="flex-1">
                    <h4 className="text-base font-semibold text-gray-900 mb-1">You’re not connected to WhatsApp</h4>
                    <p className="text-sm text-gray-600">To receive reminders, you need to enable WhatsApp messages.</p>
                    <div className="mt-3 flex gap-2">
                        <button
                            onClick={() => {
                                openWhatsApp();
                                closeToast();
                            }}
                            className="px-4 py-1.5 text-sm font-medium rounded-md bg-green-600 text-white hover:bg-green-700 transition"
                        >
                            Turn on now
                        </button>
                        <button
                            onClick={closeToast}
                            className="px-3 py-1.5 text-sm font-medium rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                        >
                            Dismiss
                        </button>
                    </div>
                </div>
            </div>
        ),
        {
            autoClose: false,
            closeOnClick: false,
            draggable: true,
            closeButton: false,
            position: 'top-right',
        }
    );
};
