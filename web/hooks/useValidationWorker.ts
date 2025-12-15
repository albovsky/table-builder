"use client";

import { useEffect, useRef } from 'react';
import { useStore } from '@/store/useStore';
import { useTravelData } from '@/features/travel/hooks/useTravelData';
import { useAddressData } from '@/features/address/hooks/useAddressData';

export function useValidationWorker() {
  const { workMode, setValidationErrors } = useStore();
  const { data: travelData } = useTravelData();
  const { data: addressData } = useAddressData();
  
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    // Initialize worker
    workerRef.current = new Worker(new URL('../worker/table.worker.ts', import.meta.url));

    workerRef.current.onmessage = (e) => {
      const { status, result } = e.data;
      if (status === 'success') {
        setValidationErrors(result);
      }
    };

    return () => {
      workerRef.current?.terminate();
    };
  }, [setValidationErrors]);

  // Trigger validation when data or mode changes
  useEffect(() => {
    if (!workerRef.current) return;

    if (workMode === 'travel') {
      workerRef.current.postMessage({
        type: 'VALIDATE_TRAVEL',
        payload: travelData,
        id: 'validate-travel-' + Date.now()
      });
    } else {
      workerRef.current.postMessage({
        type: 'VALIDATE_ADDRESS',
        payload: addressData,
        id: 'validate-address-' + Date.now()
      });
    }
  }, [workMode, travelData, addressData]);
}
