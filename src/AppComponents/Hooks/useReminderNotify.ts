import { useState } from 'react';
import { API_BASE_URL } from '../Utilities/Constant';

interface ReminderPayload {
  to: string;
  assigneeName: string;
  taskName: string;
  dueDate: string;
}

interface ReminderState {
  loading: boolean;
  success: boolean | null;
  error: string | null;
}

export function useReminderNotify() {
  const [state, setState] = useState<ReminderState>({
    loading: false,
    success: null,
    error: null,
  });

  const sendReminder = async (payload: ReminderPayload) => {
    setState({ loading: true, success: null, error: null });

    try {
      const res = await fetch(`${API_BASE_URL}/api/notify/remind`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        setState({ loading: false, success: true, error: null });
      } else {
        setState({ loading: false, success: false, error: data.error });
      }
    } catch (err: any) {
      setState({ loading: false, success: false, error: err.message });
    }
  };

  return { ...state, sendReminder };
}